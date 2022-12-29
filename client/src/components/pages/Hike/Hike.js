import { useState, useEffect } from 'react';
import { Container, Row, Col, OverlayTrigger, Tooltip, Button, Tabs, Tab } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import HikeMap from '../../HikeMap';
import { MyImageModal, StartTerminateHikeModal, StopHikeModal, ReferencePointReachedModal } from './TrackedHikesModals';
import { TrackedHikesInfoTable, TrackedHikesInfoModal } from './TrackedHikesInfo';
import API from '../../../API';
import '../../../styles/SinglePageHike.css';
import { default as Hiking } from '../../../icons/hiking.svg';
import { default as Location } from "../../../icons/map.svg";
import { default as Length } from "../../../icons/location-on-road.svg";
import { default as Time } from "../../../icons/stopwatch.svg";
import { default as Ascent } from "../../../icons/mountain.svg";
import { default as User } from "../../../icons/user-login.svg";
import { default as Difficulty } from "../../../icons/volume.svg";
import { default as Img1 } from "../../../images/image3.jpg";
import { default as FakeMap } from "../../../images/fakeMap.jpg";

// from https://stackoverflow.com/questions/639695/how-to-convert-latitude-or-longitude-to-meters
function coordinatesDistanceInMeter(lat1, lon1, lat2, lon2) {  // generally used geo measurement function
  const R = 6378.137; // Radius of earth in KM
  const dLat = lat2 * Math.PI / 180 - lat1 * Math.PI / 180;
  const dLon = lon2 * Math.PI / 180 - lon1 * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d * 1000; // meters
}

function HikePage(props) {

  const navigate = useNavigate();

  const [hike, setHike] = useState({});
  const [dirty, setDirty] = useState(true);
  const [alreadyLinkedHut, setAlreadyLinkedHut] = useState([]);
  const radiusDistance = 5000; // 5km
  const [trackedHikes, setTrackedHikes] = useState([]);

  let { hikeId } = useParams();
  hikeId = parseInt(hikeId);

  useEffect(() => {
    if (dirty) {
      API.getHike(hikeId)
        .then((hike) => {
          setHike(hike);

          let tempAlreadyLinkedHut = hike.points.filter((h) => (h.startPoint === 0 && h.endPoint === 0 && h.referencePoint === 0 && h.hutID));
          for (let i = 0; i < hike.points?.length; i = i + 25) {
            // per ogni punto dell'hike verifico la distanza dall'hut linkato
            tempAlreadyLinkedHut.concat(tempAlreadyLinkedHut?.filter((h) => coordinatesDistanceInMeter(hike.points[i].latitude, hike.points[i].longitude, h.latitude, h.longitude) < radiusDistance));
          }
          setAlreadyLinkedHut(tempAlreadyLinkedHut);

          if (props.loggedIn) {
            API.getTrackedHikesByHikeIDAndUserID(hikeId)
              .then((trackedHikes) => {
                setTrackedHikes(trackedHikes);

                if (trackedHikes.filter(th => th.endTime === null || th.endTime === undefined).length === 1) {   // there is an ongoing hike
                  const refPointsReachedInOngoingHike = trackedHikes.filter(th => th.endTime === null || th.endTime === undefined).pop().pointsReached?.sort((a, b) => (a.pointID > b.pointID) ? 1 : -1);

                  if (refPointsReachedInOngoingHike.length > 0) {
                    const maxRefPointReachedInOngoingHike = refPointsReachedInOngoingHike[refPointsReachedInOngoingHike.length - 1];

                    for (let point of hike.points) {
                      point.reachedInOngoingHike = point.pointID <= maxRefPointReachedInOngoingHike.pointID;    // generic point is before latest reached point

                      // search if current point is a previously reached reference point; if so, save time of reach
                      const refPointReached = refPointsReachedInOngoingHike.find(refPointReached => point.pointID === refPointReached.pointID);
                      if (refPointReached)
                        point.timeOfReachInOngoingHike = refPointReached.timeOfReach;
                    }
                  }
                }
              })
              .catch(err => console.log(err));
          }
        })
        .catch(err => console.log(err));

      setDirty(false);
    }
  }, [dirty, hikeId]);

  const startHike = async (startTime) => {
    if (trackedHikes.filter(th => th.endTime === null || th.endTime === undefined).length !== 0) {
      console.log('There is already an ongoing hike: impossible to start a new one.');
      return;
    }

    API.startHike(hikeId, startTime)
      .then(() => {
        setDirty(true);
        setStartTerminateHikeModalShow(false);
      })
      .catch(err => console.log(err));
  }

  const recordReferencePointReached = async (pointID, time) => {
    if (trackedHikes.filter(th => th.endTime === null || th.endTime === undefined).length !== 1) {
      console.log('More than one ongoing hike found: impossible to record a reference point as reached.');
      return;
    }

    const trackedHikeID = trackedHikes.filter(th => th.endTime === null || th.endTime === undefined).pop().id;

    API.recordReferencePointReached(trackedHikeID, pointID, time)
      .then(() => {
        setDirty(true);
        setReferencePointReachedModalShow(false);
      })
      .catch(err => console.log(err));
  }

  const terminateHike = async (endTime) => {
    if (trackedHikes.filter(th => th.endTime === null || th.endTime === undefined).length !== 1) {
      console.log('More than one ongoing hike found: impossible to terminate.');
      return;
    }

    const trackedHikeID = trackedHikes.filter(th => th.endTime === null || th.endTime === undefined).pop().id;

    API.terminateHike(trackedHikeID, endTime)
      .then(() => {
        setDirty(true);
        setStartTerminateHikeModalShow(false);
      })
      .catch(err => console.log(err));
  }

  const stopHike = async (stopTime) => {
    if (trackedHikes.filter(th => th.endTime === null || th.endTime === undefined).length !== 1) {
      console.log('More than one ongoing hike found: impossible to stop.');
      return;
    }

    const trackedHikeID = trackedHikes.filter(th => th.endTime === null || th.endTime === undefined).pop().id;

    API.stopHike(trackedHikeID, stopTime)
      .then(() => {
        setDirty(true);
        setStopHikeModalShow(false);
      })
      .catch(err => console.log(err));
  }

  const cancelHike = async () => {
    if (trackedHikes.filter(th => th.endTime === null || th.endTime === undefined).length !== 1) {
      console.log('More than one ongoing hike found: impossible to cancel.');
      return;
    }

    const trackedHikeID = trackedHikes.filter(th => th.endTime === null || th.endTime === undefined).pop().id;

    API.cancelHike(trackedHikeID)
      .then(() => setDirty(true))
      .catch(err => console.log(err));
  }

  const difficultiesNames = ['Tourist', 'Hiker', 'Pro Hiker'];
  let locationsArray = [];
  if (hike.municipality) locationsArray.push(hike.municipality);
  if (hike.province) locationsArray.push(hike.province);
  if (hike.region) locationsArray.push(hike.region);
  if (hike.state) locationsArray.push(hike.state);

  const [imageModalShow, setImageModalShow] = useState(false);
  const [startTerminateHikeModalShow, setStartTerminateHikeModalShow] = useState(false);
  const [stopHikeModalShow, setStopHikeModalShow] = useState(false);
  const [referencePointReachedModalShow, setReferencePointReachedModalShow] = useState(false);
  const [trackedHikesInfoModalShow, setTrackedHikesInfoModalShow] = useState(false);

  return (
    <Container fluid className="external-box">
      <MyImageModal hikeId={hike.id} hikeLabel={hike.label} show={imageModalShow} onHide={() => setImageModalShow(false)} />
      <StartTerminateHikeModal startHike={startHike} terminateHike={terminateHike} show={startTerminateHikeModalShow} onHide={() => setStartTerminateHikeModalShow(false)} />
      <StopHikeModal stopHike={stopHike} show={stopHikeModalShow} onHide={() => setStopHikeModalShow(false)} />
      <ReferencePointReachedModal recordReferencePointReached={recordReferencePointReached} show={referencePointReachedModalShow} onHide={() => setReferencePointReachedModalShow(false)} />
      <TrackedHikesInfoModal show={trackedHikesInfoModalShow} onHide={() => setTrackedHikesInfoModalShow(false)} hike={hike} trackedHikes={trackedHikes} />
      <Container fluid className='internal-box' >
        <Row className="center-box mb-4">
          <Col md={12} className="center-box">
            <h2 className="background double single-hike-title "><span><img src={Hiking} alt="hiking_image" className='me-2 single-hike-icon' />{hike.label}</span></h2>
          </Col>
        </Row>
        <Row className="mx-4">
          <Col md={3} >
            <Row>
              <Col md={12} className='mb-4 align'>
                <img src={`http://localhost:3001/images/hike-${hike.id}.jpg`}
                  onError={({ currentTarget }) => {
                    currentTarget.onerror = null; // prevents looping
                    currentTarget.src = Img1;
                  }} alt="photo" className="side-hike-img" onClick={() => setImageModalShow(true)} />
              </Col>
            </Row>
            <Row>
              <h6 className='side-title'>Location:</h6>
            </Row>
            <Row className="info-row">
              <Col md={12} className='mb-4 align'>
                <OverlayTrigger placement="bottom" delay={{ show: 250, hide: 400 }} overlay={<Tooltip id="button-tooltip-2">Location</Tooltip>}>
                  <img src={Location} alt="location_image" className='me-3 single-hike-icon' />
                </OverlayTrigger>
                <p className='p-hike'>{locationsArray.join(", ")}</p>
              </Col>
            </Row>
            <Row>
              <h6 className='side-title'>Track:</h6>
            </Row>
            <Row className="info-row">
              <Col lg={6} md={12} sm={6} xs={6} className='mb-3 align'>
                <OverlayTrigger placement="bottom" delay={{ show: 250, hide: 400 }} overlay={<Tooltip id="button-tooltip-2">Length</Tooltip>}>
                  <img src={Length} alt="length_image" className='me-3 single-hike-icon' />
                </OverlayTrigger>
                <p className='p-hike'>{Math.round(hike.length)} m</p>
              </Col>
              <Col lg={6} md={12} sm={6} xs={6} className='mb-3 align'>
                <OverlayTrigger placement="bottom" delay={{ show: 250, hide: 400 }} overlay={<Tooltip id="button-tooltip-2">Ascent</Tooltip>}>
                  <img src={Ascent} alt="ascent_image" className='me-3 single-hike-icon' />
                </OverlayTrigger>
                <p className='p-hike'>{Math.round(hike.ascent)} m</p>
              </Col>
            </Row>
            <Row>
              <h6 className='side-title'>Experience:</h6>
            </Row>
            <Row className="info-row">
              <Col lg={6} md={12} sm={6} xs={6} className='mb-3 align'>
                <OverlayTrigger placement="bottom" delay={{ show: 250, hide: 400 }} overlay={<Tooltip id="button-tooltip-2">Expected time</Tooltip>}>
                  <img src={Time} alt="time_image" className='me-3 single-hike-icon' />
                </OverlayTrigger>
                <p className='p-hike'>{hike.expTime} {hike.expTime === 1 ? 'hour' : 'hours'}</p>
              </Col>
              <Col lg={6} md={12} sm={6} xs={6} className='mb-3 align '>
                <OverlayTrigger placement="bottom" delay={{ show: 250, hide: 400 }} overlay={<Tooltip id="button-tooltip-2">Difficulty</Tooltip>}>
                  <img src={Difficulty} alt="difficulty_image" className='me-3 single-hike-icon ' />
                </OverlayTrigger>
                <p className='p-hike'>{difficultiesNames[hike.difficulty - 1]}</p>
              </Col>
            </Row>
            <Row>
              <h6 className='side-title'>Author:</h6>
            </Row>
            <Row className="info-row">
              <Col md={12} className='mb-4 align'>
                <OverlayTrigger placement="bottom" delay={{ show: 250, hide: 400 }} overlay={<Tooltip id="button-tooltip-2">Author</Tooltip>}>
                  <img src={User} alt="time_image" className='me-3 single-hike-icon bigger-icon' />
                </OverlayTrigger>
                <p className='p-hike'>{hike.author}</p>
              </Col>
            </Row>
          </Col>
          <Col md={{ span: 7, offset: 1 }} >
            <Row className='mt-3'>
              {!props.loggedIn ?
                <div className="hike-page-container">
                  <img src={FakeMap} alt="fake_map" className="fake-image" />
                  <div className="middle">
                    <h3 className='mb-5 text'>Sign In to look the Map!</h3>
                    <Button variant="primary log_btn slide" type="submit" onClick={() => { props.setShowLogin(true); navigate("/"); }} > Sign In </Button>
                  </div>
                </div> : hike.id && <HikeMap length={hike.length} points={hike.points} alreadyLinkedHut={alreadyLinkedHut} showOngoing
                  showStartHike={trackedHikes.filter(th => th.endTime === null || th.endTime === undefined).length === 0} setTrackedHikeModalShow={setStartTerminateHikeModalShow}
                  showTerminateHike={trackedHikes.filter(th => th.endTime === null || th.endTime === undefined).length === 1} setReferencePointReachedModalShow={setReferencePointReachedModalShow} />}
              {/* hike.id ensures that the map is rendered only when the hike is loaded  */}
            </Row>
            <Row className='btn-row'>
              {props.loggedIn && trackedHikes.filter(th => th.endTime === null || th.endTime === undefined).length === 0 && <Button className="mx-1 mt-2 start_btn slide" type="submit" onClick={() => setStartTerminateHikeModalShow('start')}>Start hike</Button>}
              {props.loggedIn && trackedHikes.filter(th => th.endTime === null || th.endTime === undefined).length === 1 && <Button className="mx-1 mt-2 cancel_btn slide" type="submit" onClick={cancelHike}>Cancel hike</Button>}
              {props.loggedIn && trackedHikes.filter(th => th.endTime === null || th.endTime === undefined).length === 1 && <Button className="mx-1 mt-2 stop_btn slide" type="submit" onClick={() => setStopHikeModalShow(true)}>Stop hike</Button>}
              {props.loggedIn && trackedHikes.filter(th => th.endTime === null || th.endTime === undefined).length === 1 && <Button className="mx-1 mt-2 terminate_btn slide" type="submit" onClick={() => setStartTerminateHikeModalShow('terminate')}>Terminate hike</Button>}
            </Row>
            {props.loggedIn && <TrackedHikesInfoTable hike={hike} trackedHikes={trackedHikes} setTrackedHikesInfoModalShow={setTrackedHikesInfoModalShow} />}
            <Row className="tab-box">
              <Tabs defaultActiveKey="description" id="justify-tab-example" className="mb-3 " justify >
                <Tab eventKey="description" title="Description" >
                  <p>{hike.description}</p>
                </Tab>
                <Tab eventKey="condition" title="Condition"  >
                  <p>Function to be implemented</p>
                </Tab>
                <Tab eventKey="weather" title="Weather Alert"  >
                  <p>Function to be implemented</p>
                </Tab>
              </Tabs>
            </Row>
          </Col>
        </Row>
      </Container>
    </Container>
  );
}

export default HikePage;