import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, ButtonGroup, ButtonToolbar, OverlayTrigger, Tooltip } from "react-bootstrap";
import '../styles/HutSection.css';
import { default as Hut } from '../icons/hut.svg';
import { default as arrowRight } from '../icons/arrow-right.svg';
import { default as arrowLeft } from '../icons/arrow-left.svg';
import { default as Delete } from '../icons/delete.svg';
import { FaSearch } from "react-icons/fa";
import { FaBed } from "react-icons/fa";
import { FaLocationArrow } from "react-icons/fa";
import { FaMountain } from "react-icons/fa";
import { ImPriceTag } from "react-icons/im";
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { default as image4 } from "../images/image4.jpg";
import API from './../API.js';

function MyHutSection() {
  const [huts, setHuts] = useState([]);
  const [dirty, setDirty] = useState(true);
  const [search,setSearch] = useState(true);
  const [tempName1,setTempName1] = useState('');
  const [tempName2,setTempName2] = useState('');

  const clearHuts = () =>{
    setSearch(true);
  }


  useEffect(() => {
    if (dirty) {
      API.getHuts()
        .then((huts) => setHuts(huts))
        .catch(err => console.log(err))
      setDirty(false);
    }
  }, [dirty]);

  const renderTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props} >
      Remove all filters
    </Tooltip>
  );


  return (
    <>
      <Container fluid className="hutSection" id="hutSec">
        <Row>
          <h2 className="background double hut-title"><span><img src={Hut} alt="hut_image" className='me-2 hike-img' />HUTS</span></h2>
        </Row>
        <Row className='mt-5'>
          <div className="search-box">
            <button className="btn-search"><FaSearch className="icon" onClick={() => {setTempName2(tempName1); setSearch(false)}}  /></button>
            <input type="text" className="input-search" placeholder="Type to Search..." value={tempName1} onChange={ev => {setTempName1(ev.target.value)}}/>
          </div>
        </Row>
        <Row className='mt-5'>
          <Col md="auto" sm="auto" xs="auto" >
            <ButtonToolbar aria-label="Toolbar with button groups" >
              <ButtonGroup className='my-1  me-3' size="lg" aria-label="First group">
                <Button variant="success" className='btn_filter btn-filter-hut' >Location</Button>
                <Button variant="success" className='btn_filter btn-filter-hut' >Ascent</Button>
                <Button variant="success" className='btn_filter btn-filter-hut' >Number of beds</Button>
                <Button variant='success' className='btn_filter btn-filter-hut' >Services</Button>
              </ButtonGroup>
              <ButtonGroup className="my-1" aria-label="Second group">
                <OverlayTrigger placement="right" delay={{ show: 250, hide: 400 }} overlay={renderTooltip} >
                  <Button className="delete-btn"><img src={Delete} alt="delete_image" className='' onClick={clearHuts} /></Button>
                </OverlayTrigger>
              </ButtonGroup>
            </ButtonToolbar>
          </Col>
        </Row>

      </Container>
      <Container fluid className="hutCardSection">

        <Row>
          <HutCards huts={huts} search={search} tempName={tempName2} />
        </Row>
      </Container>
    </>
  );

}

function HutCards(props) {

  function SampleNextArrow(props) {
    const { onClick } = props;
    return (
      <img src={arrowRight} alt="hut_image" className='arrow-next' onClick={onClick} />
    );
  }

  function SamplePrevArrow(props) {
    const { onClick } = props;
    return (
      <img src={arrowLeft} alt="hut_image" className='arrow-prev' onClick={onClick} />
    );
  }

  const settings = {
    dots: true,
    infinite: props.huts.length > 4,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 4,
    initialSlide: 0,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    responsive: [
      {
        breakpoint: 1120,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: props.huts.length > 3
        },
      },
      {
        breakpoint: 720,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          infinite: props.huts.length > 2
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: props.huts.length > 1
        },
      },
    ],
  };

  return (
    <div className="hutCardBox">
      <Slider {...settings}>
        {props.huts.map((hut) => {

          let locationsArray = [];
          if (hut.municipality) locationsArray.push(hut.municipality);
          if (hut.province) locationsArray.push(hut.province);
          if (hut.region) locationsArray.push(hut.region);
          if (hut.state) locationsArray.push(hut.state);
          if(props.search || (props.search == false && hut.name.toLowerCase().match(props.tempName.toLowerCase()))){
          return (<div className="hut-card" key={hut.id}>
            <div className="card-top">
              <img src={`http://localhost:3001/images/hut-${hut.id}.jpg`}
                onError={({ currentTarget }) => {
                  currentTarget.onerror = null; // prevents looping
                  currentTarget.src = image4;
                }} alt={hut.name} className="card-top-img" />
            </div>
            <div className="card-bottom">
              <div>
                <h1 className="hut-card-title">{hut.name}</h1>
              </div>
              <Row >
                <Col xs={2}>
                  <FaLocationArrow className="card-symbol me-3" />
                </Col>
                <Col>
                  <h6 className="card-details">{locationsArray.join(", ")}</h6>
                </Col>
              </Row>
              <Row >
                <Col xs={2}>
                  <FaMountain className="card-symbol me-3" />
                </Col>
                <Col>
                  <h6 className="card-details">{hut.altitude} m</h6>
                </Col>
              </Row>
              <Row >
                <Col xs={2}>
                  <FaBed className="card-symbol me-3" />
                </Col>
                <Col>
                  <h6 className="card-details">{hut.beds} beds</h6>
                </Col>
              </Row>
            </div>
          </div>);}
        })}

      </Slider>
    </div>
  );
}

export default MyHutSection;