import React from 'react';
import { IoIosPrint, IoMdSave, IoIosInformationCircle } from 'react-icons/io';
import './HeaderBar.css';

const HeaderBar = ({ handlePrintClick, handleSaveClick, handleInfoClick }) => {
    
    return (
        <div className='header'>
            <h2>lsMaps</h2>
            <div className="header-buttons">
                <button onClick={handlePrintClick}>
                    <IoIosPrint />
                </button>
                <button onClick={handleSaveClick}>
                    <IoMdSave />
                </button>
                <button onClick={handleInfoClick}>
                    <IoIosInformationCircle />
                </button>
            </div>
        </div>
    );
};

export default HeaderBar;