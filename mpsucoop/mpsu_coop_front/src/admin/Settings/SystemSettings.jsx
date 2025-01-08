import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaCog, FaUsers} from 'react-icons/fa';
import './SystemSettings.css';


const SystemSettings = () => {
    const [settings, setSettings] = useState({
        interest_rate: 0,
        service_fee_rate_emergency: 0,
        penalty_rate: 0,
        service_fee_rate_regular_1yr: 0,
        service_fee_rate_regular_2yr: 0,
        service_fee_rate_regular_3yr: 0,
        service_fee_rate_regular_4yr: 0,
    });

    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState(null);
    const [isSettingsActive, setIsSettingsActive] = useState(false); // Tracks whether settings are active
    const navigate = useNavigate();

    useEffect(() => {
        if (isSettingsActive) {
            axios
                .get('http://127.0.0.1:8000/api/system-settings/')
                .then(response => {
                    setSettings(response.data);
                })
                .catch(err => {
                    setError('Error fetching system settings.');
                    console.error(err);
                });
        }
    }, [isSettingsActive]);

    const handleChange = e => {
        const { name, value } = e.target;
        setSettings({
            ...settings,
            [name]: value,
        });
    };

    const handleUpdate = () => {
        axios
            .put('http://127.0.0.1:8000/api/system-settings/', settings)
            .then(response => {
                setSettings(response.data);
                setIsEditing(false);
            })
            .catch(err => {
                setError('Error updating system settings.');
                console.error(err);
            });
    };

    const handleMenuItemClick = menuItem => {
        switch (menuItem) {
            case 'Settings':
                setIsSettingsActive(true);
                break;
            default:
                break;
        }
    };


    return (
        <div>
            {/* Navbar */}
            <nav className="navbar">
                <a className="nav-item" onClick={() => handleMenuItemClick('Settings')}>
                    <FaCog /> System Settings
                </a>
            </nav>

            {/* Show content only when "Settings" is clicked */}
            {isSettingsActive && (
                <div className="system-settings">
                    <h2 style={{ color: 'black' }}>System Settings</h2>

                    {error && <div className="error">{error}</div>}

                    <table className="settings-table">
                        <thead>
                            <tr>
                                <th className="table-cell">Setting</th>
                                <th className="table-cell">Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="table-cell">Interest Rate:</td>
                                <td className="table-cell">
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            name="interest_rate"
                                            value={settings.interest_rate}
                                            onChange={handleChange}
                                        />
                                    ) : (
                                        <span>{settings.interest_rate}%</span>
                                    )}
                                </td>
                            </tr>

                            <tr>
                                <td className="table-cell">Emergency Loan Service Fee Rate:</td>
                                <td className="table-cell">
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            name="service_fee_rate_emergency"
                                            value={settings.service_fee_rate_emergency}
                                            onChange={handleChange}
                                        />
                                    ) : (
                                        <span>{settings.service_fee_rate_emergency}%</span>
                                    )}
                                </td>
                            </tr>

                            <tr>
                                <td className="table-cell">Penalty Rate:</td>
                                <td className="table-cell">
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            name="penalty_rate"
                                            value={settings.penalty_rate}
                                            onChange={handleChange}
                                        />
                                    ) : (
                                        <span>{settings.penalty_rate}%</span>
                                    )}
                                </td>
                            </tr>

                            <tr>
                                <td className="table-cell">Regular Loan Service Fee (1 year):</td>
                                <td className="table-cell">
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            name="service_fee_rate_regular_1yr"
                                            value={settings.service_fee_rate_regular_1yr}
                                            onChange={handleChange}
                                        />
                                    ) : (
                                        <span>{settings.service_fee_rate_regular_1yr}%</span>
                                    )}
                                </td>
                            </tr>

                            <tr>
                                <td className="table-cell">Regular Loan Service Fee (2 years):</td>
                                <td className="table-cell">
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            name="service_fee_rate_regular_2yr"
                                            value={settings.service_fee_rate_regular_2yr}
                                            onChange={handleChange}
                                        />
                                    ) : (
                                        <span>{settings.service_fee_rate_regular_2yr}%</span>
                                    )}
                                </td>
                            </tr>

                            <tr>
                                <td className="table-cell">Regular Loan Service Fee (3 years):</td>
                                <td className="table-cell">
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            name="service_fee_rate_regular_3yr"
                                            value={settings.service_fee_rate_regular_3yr}
                                            onChange={handleChange}
                                        />
                                    ) : (
                                        <span>{settings.service_fee_rate_regular_3yr}%</span>
                                    )}
                                </td>
                            </tr>

                            <tr>
                                <td className="table-cell">Regular Loan Service Fee (4 years):</td>
                                <td className="table-cell">
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            name="service_fee_rate_regular_4yr"
                                            value={settings.service_fee_rate_regular_4yr}
                                            onChange={handleChange}
                                        />
                                    ) : (
                                        <span>{settings.service_fee_rate_regular_4yr}%</span>
                                    )}
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="actions">
                        {isEditing ? (
                            <>
                                <button onClick={handleUpdate}>
                                    Save Changes
                                </button>
                                <button onClick={() => setIsSettingsActive(false)}>
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => setIsEditing(true)}>
                                    Edit Settings
                                </button>
                                <button onClick={() => setIsSettingsActive(false)}>
                                    Back
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SystemSettings;


