import React, { useState } from 'react';
import { Button, ListGroup, Modal, Col, Row, Form, Container, ButtonToolbar, ButtonGroup } from "react-bootstrap";
import '../styles/FilterSection.css';
import { default as Close } from '../icons/close.svg';

function FilterSection() {

  const [modalShow, setModalShow] = useState(false);
  const [title, setTitle] = useState(false);
  const [desc, setDesc] = useState(false); 

    return (

      <Container fluid className='filterSection'>
        <Row>
          <h1>Find your perfect destinations!</h1>
        </Row>
        <Row className='mt-5'>
          <Col md="auto" sm="auto" xs="auto" >
            <ButtonToolbar aria-label="Toolbar with button groups" >
              <ButtonGroup className='my-1' size="lg" aria-label="First group">
                <Button variant="success" className='btn_filter' onClick={() => { setModalShow(true); setTitle("Length (kms)"); setDesc("Select a specific length:") }}>Length</Button>
                <Button variant="success" onClick={() => { setModalShow(true); setTitle("Expected time"); setDesc("Select a specific expected time:") }}>Time</Button>
                <Button variant="success" onClick={() => { setModalShow(true); setTitle("Ascent (meters)"); setDesc("Select a specific ascent:") }}>Ascent</Button>
                <Button variant="success" className='btn_filter' onClick={() => { setModalShow(true); setTitle("Difficulty"); setDesc("Select a specific difficulty:") }}>Difficulty</Button>
                <Button variant='success' className='btn_filter' onClick={() => { setModalShow(true); setTitle("Location"); setDesc("Select a specific location:") }}>Location</Button>
              </ButtonGroup>
              <ButtonGroup size="lg" className='my-1 me-2'>
                <Button variant="success" className='btn_filter' onClick={() => { setModalShow(true); setTitle("Start point"); setDesc("Select a specific start point:") }}>Start point</Button>
                <Button variant="success" onClick={() => { setModalShow(true); setTitle("End point"); setDesc("Select a specific end point:") }}>End point</Button>
                <Button variant="success" className='btn_filter' onClick={() => { setModalShow(true); setTitle("Reference points"); setDesc("Select reference points:") }}>Reference points</Button>
              </ButtonGroup>
              <ButtonGroup className="my-1" aria-label="Second group">
                <Button variant="danger">Remove filter</Button>
              </ButtonGroup>
              </ButtonToolbar>
          </Col>
        </Row>
        <MyModal show={modalShow} onHide={() => setModalShow(false)} title={title} desc={desc} />
        <Row className='mt-3'>
          <ButtonToolbar aria-label="Toolbar with button groups" >
            <Button variant="info" disabled size="sm" className='mx-2 my-1 btn_info px-2'>Lenght: 10km <img src={Close} alt="close" className='ms-1 mb-1' /></Button>
            <Button variant="info" disabled size="sm" className='mx-2 my-1 btn_info px-2'>Time: 1h <img src={Close} alt="close" className='ms-1 mb-1' /></Button>
            <Button variant="info" disabled size="sm" className='mx-2 my-1 btn_info px-2'>Location: Torino <img src={Close} alt="close" className='ms-1 mb-1' /></Button>
            <Button variant="info" disabled size="sm" className='mx-2 my-1 btn_info px-2'>Start point: Poli <img src={Close} alt="close" className='ms-1 mb-1' /></Button>
          </ButtonToolbar>
        </Row>
      </Container>

    );
  }

  function MyModal(props) {

    return (
  
      <Modal {...props} aria-labelledby="contained-modal-title-vcenter" centered>
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            {props.title}
          </Modal.Title>
        </Modal.Header>
  
        <Modal.Body >
          <Container>
            <Row className="mb-2 modal_label">
              <Col md="auto" sm="auto" xs="auto">
                <h6> {props.desc} </h6>
              </Col>
              {(props.title == "Start point" || props.title == "End point" || props.title == "Reference points") ?
                <Col md={6} sm={6} xs={6}>
                  <Form.Control autoFocus className="mx-3 my-2 w-auto" placeholder="Type to filter..." />
                </Col> : false
              }
            </Row>
            {(props.title == "Difficulty") ?
              <Row>
                <Col md="auto" sm="auto" xs="auto">
                  <Button variant="success" size="sm" className='m-1'>Tourist</Button>
                </Col>
                <Col md="auto" sm="auto" xs="auto">
                  <Button variant="warning" size="sm" className='m-1'>Hiker</Button>
                </Col>
                <Col md="auto" sm="auto" xs="auto">
                  <Button variant="dark" size="sm" className='m-1'>Professional hiker</Button>
                </Col>
              </Row> :
              (props.title == "Start point" || props.title == "End point" || props.title == "Reference points") ?
                <ListGroup variant="flush" >
                  <ListGroup.Item action>Cras justo odio</ListGroup.Item>
                  <ListGroup.Item action>Dapibus ac facilisis in</ListGroup.Item>
                  <ListGroup.Item action>Morbi leo risus</ListGroup.Item>
                  <ListGroup.Item action>Porta ac consectetur ac</ListGroup.Item>
                </ListGroup> :
              (props.title == "Location") ? 
                  <Container fluid> 
                  <Form.Select className="my-3" aria-label="Select a province">
                    <option>Select a province</option>
                    <option value="1">One</option>
                    <option value="2">Two</option>
                    <option value="3">Three</option>
                  </Form.Select>
                  <Form.Select className="my-3" aria-label="Select a municipality">
                    <option>Select a municipality</option>
                    <option value="1">One</option>
                    <option value="2">Two</option>
                    <option value="3">Three</option>
                  </Form.Select>
                  <Button variant='success' className="btn_filter">Radius around a point</Button>
                  </Container>
                   :
                  <Form.Range />}
          </Container>
        </Modal.Body>
  
        <Modal.Footer>
          <Row>
            <Col md="auto" sm="auto" xs="auto">
              <Button variant="danger" onClick={props.onHide}>Cancel</Button>
            </Col>
            <Col md="auto" sm="auto" xs="auto" >
              <Button variant="primary" onClick={props.onHide}>Confirm</Button>
            </Col>
          </Row>
        </Modal.Footer>
      </Modal>
    );
  }
  
  export default FilterSection;
  