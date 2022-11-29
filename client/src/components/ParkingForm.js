import { Alert, Form } from 'react-bootstrap';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useState } from 'react';
import { default as Img1 } from "../images/img1.jpg";
import { useNavigate } from 'react-router-dom';
import { Icon } from 'leaflet';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import API from '../API';
import '../styles/Map.css';
import 'leaflet/dist/leaflet.css';
import '../styles/HikeForm.css';

function ParkingForm(props) {

    const navigate = useNavigate();

    const [label, setLabel] = useState('');
    const [description, setDescription] = useState('');
    const [latitude, setLatitude] = useState(0.0);
    const [longitude, setLongitude] = useState(0.0);
    const [altitude, setAltitude] = useState(0);
    const [occupied, setOccupied] = useState(0);
    const [total, setTotal] = useState(0);
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();

        if (label.trim().length === 0)
            setErrorMsg('The label of the hike cannot be consisted of only empty spaces');
        else {
            let newParkingLot = {
                label: label,
                description: description,
                lat: latitude,
                lon: longitude,
                altitude: 2.0,
                total: total,
                occupied: occupied
            }

            // retrieve location info and address from coordinates
            API.reverseNominatim(latitude, longitude)
                .then((locationInfo) => {
                    newParkingLot.province = locationInfo.address.county;
                    newParkingLot.municipality = locationInfo.address.city || locationInfo.address.town || locationInfo.address.village;
                    props.addParkingLot(newParkingLot);
                    props.setDirty(true);
                    navigate('/parkingManager');
                })
                .catch(err => console.log(err))
        }
    }

    return (
        <Container>
            <Row>
                <Col>
                    <h1 className="hike_form-title">Add new Parking Lot</h1>
                </Col>
            </Row>

            <Row className="hut_box mx-5 py-5 px-5 mb-4">
                <Col md={13} className="box_img_box" >
                    <img className=" img_box mb-3" src={Img1} alt="First slide" />
                    <Button variant="primary" size="sm" className="btn_box"> Update Image </Button>
                </Col>

                <Row>
                    <Col>
                        {errorMsg ? <Alert variant='danger' onClose={() => setErrorMsg('')} dismissible>{errorMsg}</Alert> : false}
                        <Form onSubmit={handleSubmit}>
                            <Form.Group>
                                <Form.Label>Label</Form.Label>
                                <Form.Control required={true} value={label} onChange={ev => setLabel(ev.target.value)}></Form.Control>
                            </Form.Group>

                            <Form.Group>
                                <Form.Label>Altitude [m]</Form.Label>
                                <Form.Control required={true} type='number' step="any" value={altitude} onChange={ev => setAltitude(ev.target.value)} />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Total Slots</Form.Label>
                                <Form.Control required={true} type='number' step="any" value={total} onChange={ev => setTotal(ev.target.value)} />
                            </Form.Group>

                            <Form.Group>
                                <Form.Label>Occupied Slots</Form.Label>
                                <Form.Control required={true} type='number' step="any" value={occupied} onChange={ev => setOccupied(ev.target.value)} />
                            </Form.Group>


                            <Form.Group>
                                <Form.Label>Description</Form.Label>
                                <Form.Control required={true} value={description} onChange={ev => setDescription(ev.target.value)} />
                            </Form.Group>
                            <Row className='my-3 box_btn'>
                                <div className='d-flex justify-content-center'>
                                    <h3>Click on the map to select the parking's location</h3>
                                </div>
                                <ParkingMap setLatitude={setLatitude} setLongitude={setLongitude} />
                            </Row>
                            <Button className='save-button' type='submit' >Save</Button>
                            <Button className='back-button' onClick={() => navigate('/parkingManager')} variant='secondary' >Back</Button>
                        </Form>
                    </Col>
                </Row>
            </Row>
        </Container>
    );
}

function ParkingMap(props) {
    return (
        <MapContainer center={[45.177786, 7.083372]} zoom={10} scrollWheelZoom={false}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker setLatitude={props.setLatitude} setLongitude={props.setLongitude} />
        </MapContainer>
    );
}

function LocationMarker(props) {
    const markerIcon = new Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    const [marker, setMarker] = useState([45.177786, 7.083372]);

    useMapEvents({
        click(e) {
            props.setLatitude(e.latlng.lat);
            props.setLongitude(e.latlng.lng);
            setMarker([e.latlng.lat, e.latlng.lng]);
        }
    });

    return (<Marker position={marker} icon={markerIcon} />);
}

export default ParkingForm;