import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaCog, FaArchive, FaUsers } from 'react-icons/fa';

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
    const [isSettingsActive, setIsSettingsActive] = useState(false);
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
                    console.error('System Settings API Error:', err.response || err);
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
                console.error('Update Settings Error:', err.response || err);
            });
    };

    const handleMenuItemClick = menuItem => {
        switch (menuItem) {
            case 'Settings':
                setIsSettingsActive(true);
                break;
            case 'Archive':
                navigate('/archived-records');
                setIsSettingsActive(true);
                break;
            case 'Usermgmt':
                navigate('/user-mgmt'); 
                break;
            default:
                break;
        }
    };

    return (
        <div>
            {/* Navbar */}
            <nav className="navbar" style={{ display: 'flex', justifyContent: 'center', padding: '10px', gap: '300px' }}>
                <a
                    className="nav-item"
                    onClick={() => handleMenuItemClick('Settings')}
                    style={{
                        color: 'black',
                        fontSize: '20px',
                        textDecoration: 'none',
                        cursor: 'pointer',
                    }}
                >
                    <FaCog /> System Settings
                </a>

                <a
                    className="nav-item"
                    onClick={() => handleMenuItemClick('Archive')}
                    style={{
                        color: 'black',
                        fontSize: '20px',
                        textDecoration: 'none',
                        cursor: 'pointer',
                    }}
                >
                    <FaArchive /> Archive Records
                </a>

                <a
                    className="nav-item"
                    onClick={() => handleMenuItemClick('Usermgmt')}
                    style={{
                        color: 'black',
                        fontSize: '20px',
                        textDecoration: 'none',
                        cursor: 'pointer',
                    }}
                >
                    <FaUsers /> User Management
                </a>
            </nav>

            {/* Show content for "Settings" */}
            {isSettingsActive && (
                <div className="system-settings" style={{ padding: '5px' }}>
                    <h2 style={{ color: 'black', textAlign: 'center', marginTop: '20px' }}>System Settings</h2>
                    {error && <div className="error" style={{ color: 'red', textAlign: 'center' }}>{error}</div>}

                    <table className="settings-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid black' }}>
                                <th className="table-cell" style={{ padding: '10px', textAlign: 'left' }}>Setting</th>
                                <th className="table-cell" style={{ padding: '10px', textAlign: 'left' }}>Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.keys(settings).map((key) => (
                                <tr key={key}>
                                    <td className="table-cell" style={{ padding: '5px' }}>{key.replace(/_/g, ' ').toUpperCase()}:</td>
                                    <td className="table-cell" style={{ padding: '5px' }}>
                                        {isEditing ? (
                                            <input
                                                type="number"
                                                name={key}
                                                value={settings[key]}
                                                onChange={handleChange}
                                                style={{
                                                    width: '80px',
                                                    padding: '5px',
                                                    borderRadius: '5px',
                                                    border: '1px solid black',
                                                    height: '20px'
                                                }}
                                            />
                                        ) : (
                                            <span>{settings[key]}</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="actions" style={{ marginTop: '20px', textAlign: 'center' }}>
                        {isEditing ? (
                            <>
                                <button
                                    onClick={handleUpdate}
                                    style={{
                                        padding: '10px 20px',
                                        backgroundColor: '#4CAF50',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Save Changes
                                </button>
                                <button
                                    onClick={() => setIsSettingsActive(false)}
                                    style={{
                                        padding: '10px 20px',
                                        margin: '0 10px',
                                        backgroundColor: '#f44336',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    style={{
                                        padding: '10px 20px',
                                        margin: '0 10px',
                                        backgroundColor: '#FF9800',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Edit Settings
                                </button>
                                <button
                                    onClick={() => setIsSettingsActive(false)}
                                    style={{
                                        padding: '10px 20px',
                                        margin: '0 10px',
                                        backgroundColor: '#2196F3',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                    }}
                                >
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
