import { GeoapifyContext, GeoapifyGeocoderAutocomplete } from '@geoapify/react-geocoder-autocomplete';
import { MdArrowDropUp, MdArrowDropDown } from 'react-icons/md';
import { FaBicycle, FaMotorcycle } from 'react-icons/fa';
import { MdMoped } from 'react-icons/md';
import { IoMdArrowBack, IoMdArrowForward } from 'react-icons/io';
import React, { useState } from 'react';
import './Sidebar.css';

const Sidebar = ({
    setStartCoordinate,
    setEndCoordinate,
    handleDestinationSubmit,
    toggleRouteOptions,
    expandRouteOptionSidebar,
    handleVehicleTypeSelect,
    selectedVehicle,
    forceDisableFreeway,
    maxSpeed,
    handleSpeedSliderChange,
    maxSpeedSliderCap,
    toggleDirectionOptions,
    expandDirectionsSidebar,
    direction,
    totalDistance,
    totalTime,
    unit,
    toggleSidebar,
    showSidebar,
    setStartAddress,
    setEndAddress
}) => {

    return (
        <>
            <div className={`sidebar ${showSidebar ? "visible" : "hidden"}`}>
                <form>
                    {/* CITATION: https://www.npmjs.com/package/@geoapify/react-geocoder-autocomplete */}
                    <GeoapifyContext apiKey="1f05d34fdcdc443a93731af1f6bb1c7f">
                        <div className='horizontal-input-box'>
                            <img className='input-box-icon' src='https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png' />
                            <GeoapifyGeocoderAutocomplete
                                placeholder='Choose a starting address'
                                id='start-input-box'
                                filterByCountryCode={['US']}
                                minLength={3}
                                placeSelect={(value) => {
                                    if (value === null) {
                                        setStartCoordinate([]);
                                        setStartAddress('');
                                    }
                                    else {
                                        setStartCoordinate([value.properties.lat, value.properties.lon]);
                                        setStartAddress(value.properties.formatted);
                                    }
                                }}
                            ></GeoapifyGeocoderAutocomplete>
                        </div>
                        <div className='horizontal-input-box'>
                            <img className='input-box-icon' src='https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png' />
                            <GeoapifyGeocoderAutocomplete
                                placeholder='Choose destination address'
                                id='destination-input-box'
                                filterByCountryCode={['US']}
                                minLength={3}
                                placeSelect={(value) => {
                                    if (value === null) {
                                        setEndCoordinate([]);
                                        setEndAddress('');
                                    }
                                    else {
                                        setEndCoordinate([value.properties.lat, value.properties.lon]);
                                        setEndAddress(value.properties.formatted);
                                    }
                                }}
                            ></GeoapifyGeocoderAutocomplete>
                        </div>
                    </GeoapifyContext>
                    {/* END CITATION */}
                    <button id='get-directions-btn' onClick={handleDestinationSubmit} type='submit'>Get Directions</button>
                </form>

                <div className='route-option-sidebar'>
                    <div className='sidebar-subtitle-container'>
                        <p className='sidebar-title-text'>Route Options</p>
                        <button className='expand-shrink-button' onClick={toggleRouteOptions}>{expandRouteOptionSidebar ? (<MdArrowDropUp className='expand-shrink-button-icon' />) : (<MdArrowDropDown className='expand-shrink-button-icon' />)}</button>
                    </div>
                    <div className={`route-options-content ${expandRouteOptionSidebar ? 'visible' : 'hidden'}`} >
                        <p className='route-options-subtitle-text'>Vehicle Type</p>
                        <ul className='vehicle-type-select-menu'>
                            <li
                                onClick={() => handleVehicleTypeSelect('bicycle')}
                                className={selectedVehicle === 'bicycle' ? 'selected' : ''}
                            >
                                <FaBicycle size={"2em"} />
                            </li>
                            <li
                                onClick={() => handleVehicleTypeSelect('scooter')}
                                className={selectedVehicle === 'scooter' ? 'selected' : ''}
                            >
                                <MdMoped size={"2em"} />
                            </li>
                            <li
                                onClick={() => handleVehicleTypeSelect('motorcycle')}
                                className={selectedVehicle === 'motorcycle' ? 'selected' : ''}
                            >
                                <FaMotorcycle size={"2em"} />
                            </li>
                        </ul>

                        <p className='route-options-subtitle-text'>Avoid</p>
                        <ul className='direction-options-select-menu'>
                            <li>
                                <div className='horizontal-checkbox-container'>
                                    <label>Ferry</label>
                                    <input type='checkbox' id='ferry-option'></input>
                                </div>
                            </li>
                            <li>
                                <div className='horizontal-checkbox-container'>
                                    <label>Freeway</label>
                                    <input type='checkbox' id='freeway-option' disabled={forceDisableFreeway}></input>
                                </div>
                            </li>
                        </ul>

                        <p className='route-options-subtitle-text'>Max Speed</p>
                        <div className='horizontal'>
                            <label>{maxSpeed}</label>
                            <input onChange={handleSpeedSliderChange} id='max-speed-slider' type='range' min={0} max={maxSpeedSliderCap} step={5}></input>
                        </div>
                    </div>
                </div>

                <div className='sidebar-subtitle-container'>
                    <p className='sidebar-title-text '>Directions</p>
                    <button className='expand-shrink-button' onClick={toggleDirectionOptions}>{expandDirectionsSidebar ? (<MdArrowDropUp className='expand-shrink-button-icon' />) : (<MdArrowDropDown className='expand-shrink-button-icon' />)}</button>
                </div>
                <div className={`directions-sidebar ${expandDirectionsSidebar ? 'visible' : 'hidden'}`} >
                    {
                        direction.length > 0 && (
                            <>
                                <div className='horizontal'>
                                    <p className='directions-distance-text'>{totalDistance.toFixed(1)} miles</p>
                                    <p className='directions-time-text'>{Math.round(totalTime / 60)} min</p>
                                </div>
                            </>
                        )
                    }
                    <ul className='directions-list'>
                        {direction.length > 0 ? (
                            direction.map((step, index) => (
                                <li key={index}>{step.instruction}</li>
                            ))
                        ) : (
                            <li className={'placeholder-text'}>Select a start and end address to see directions</li>
                        )}
                    </ul>
                </div>
                <div className='horizontal'>
                    <button className='close-button' onClick={toggleSidebar}><IoMdArrowBack /></button>
                </div>
            </div>

            {!showSidebar && (
                <button className='open-button' onClick={toggleSidebar}><IoMdArrowForward /></button>
            )}
        </>
    );
};

export default Sidebar;