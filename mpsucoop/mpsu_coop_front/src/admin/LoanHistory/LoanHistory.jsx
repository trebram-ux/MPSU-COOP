import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { AiOutlineUsergroupAdd } from "react-icons/ai";
import { FaTrash } from 'react-icons/fa';
import { TbFilterEdit } from "react-icons/tb";
import './LoanHistory.css';

const LoanManager = () => {
    const [members, setMembers] = useState([]);
    const [loans, setLoans] = useState([]);
    const [loanData, setLoanData] = useState({
        name: '',
        account: '',
        loan_amount: '',
        loan_period: '',
        loan_period_unit: 'months',
        loan_type: 'Emergency',
        purpose: 'Education',
        status: 'Ongoing',
    });
    const [formVisible, setFormVisible] = useState(false);
    const [editingLoan, setEditingLoan] = useState(null);
    const [errors, setErrors] = useState(null);
    const [paymentFormVisible, setPaymentFormVisible] = useState(false);
    const [selectedLoanForPayment, setSelectedLoanForPayment] = useState(null);
    const [showPrintButton, setShowPrintButton] = useState(false);
    const [newLoan, setNewLoan] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showOtherPurpose, setShowOtherPurpose] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');
    const [showFilterOptions, setShowFilterOptions] = useState(false);
    const [filter, setFilter] = useState(''); // Tracks selected filter type
    const [filteredLoans, setFilteredLoans] = useState(loans); // Assuming loans is the array you're filtering
    const [selectedDate, setSelectedDate] = useState(''); // State for selected single day date
    const [startDate, setStartDate] = useState(''); // State for start date in date range
    const [endDate, setEndDate] = useState(''); // State for end date in date range // Add this line for the filter state
    const [showNoLoanPopup, setShowNoLoanPopup] = useState(false); 
    const [shareCapital, setShareCapital] = useState(null);
    const [searchOption, setSearchOption] = useState('');
    const [loanSubmitted, setLoanSubmitted] = useState(false);



    const formatNumber = (number) => {
        if (number == null || isNaN(number)) return "N/A";
        return new Intl.NumberFormat('en-US').format(number);
      };

    const BASE_URL = 'http://localhost:8000';
    const navigate = useNavigate();

    useEffect(() => {
        const fetchShareCapital = async () => {
            if (!loanData.account) {
                setErrors('Account number is required to fetch share capital.');
                return;
            }
    
            try {
                // Replace `loanData.account` with the actual account number
                const response = await axios.get(`${BASE_URL}/accounts/${loanData.account}/sharecapital/`);
                setShareCapital(response.data.shareCapital); // Assuming the API returns { shareCapital: number }
            } catch (err) {
                console.error('Error fetching share capital:', err);
                setErrors('Error fetching share capital');
            }
        };
    
        fetchShareCapital();
    }, [loanData.account]); // Fetch share capital when account changes
    
    
    // Fetch loans
    const fetchLoans = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/loans/`);
            setLoans(response.data);
            setFilteredLoans(response.data); // Set filtered loans when the fetch is successful
        } catch (err) {
            console.error('Error fetching loans:', err.response || err);
            setErrors('Error fetching loans');
            setFilteredLoans([]); // Reset filtered loans to an empty array on error
        }
    };
    
    useEffect(() => {
        fetchLoans();
    }, []);
    
    
    const validateLoanData = () => {
        const errors = {};
        const { loan_type, loan_amount, loan_period } = loanData;

        if (!loan_amount || loan_amount <= 0) {
            errors.loan_amount = 'Loan amount must be greater than 0.';
        } else if (loan_type === 'Emergency' && loan_amount > 50000) {
            errors.loan_amount = 'Emergency loans cannot exceed 50,000.';
        } else if (loan_type === 'Regular' && loan_amount > 1500000) {
            errors.loan_amount = 'Regular loans cannot exceed 1.5 million.';
        }else if (loan_type === 'Regular' && loan_amount > shareCapital * 3) {
        errors.loan_amount = 'Regular loans cannot exceed 3 times your share capital.';
        }
    

        if (!loan_period || loan_period < 1 || loan_period > 4) {
            errors.loan_period = 'Loan period must be from 1 upto 4 years only.';
        } else if (loan_type === 'Emergency' && loan_period > 6) {
            errors.loan_period = 'Emergency loans cannot exceed 6 months.';
        }

        return errors;
    };

// Replace computed `filteredLoans` variable

    useEffect(() => {
        // Filter loans based on search query
        const search = searchQuery.toLowerCase();

        const filtered = loans.filter((loan) => {
            const matches = {
                control_number: loan.control_number?.toString().includes(search),
                account: loan.account?.toString().toLowerCase().includes(search),
                account_holder: loan.account_holder?.toLowerCase().includes(search),
                loan_type: loan.loan_type?.toLowerCase().includes(search),
                purpose: loan.purpose?.toLowerCase().includes(search),
                status: loan.status?.toLowerCase().includes(search),
            };
            return Object.values(matches).some((match) => match);
        });

        setFilteredLoans(filtered);
    }, [searchQuery, loans]);

    // Fetch members from API
    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const response = await fetch("http://localhost:8000/api/members/");
                if (!response.ok) {
                    console.error(`Fetch error: ${response.status} ${response.statusText}`);
                    return;
                }
                const data = await response.json();
                setMembers(data.members);
            } catch (error) {
                console.error("Error fetching members:", error);
            }
        };

        fetchMembers();
    }, []);

    // Filter members based on search query
    const filteredMembers = members.filter((member) =>
        member.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setLoanData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handle loan form submit (create or edit loan)
    const handleLoanSubmit = async (e) => {
        e.preventDefault();

        if (!shareCapital) {
            // Handle the case where shareCapital is not yet fetched
            setErrors('Unable to retrieve share capital.');
            return;
          }

        // Validate the form data
    const validationErrors = validateLoanData();
    if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setShowPopup(true);
        setPopupMessage('Kindly look into this.');
        return; // Stop if validation errors exist
    }

    setErrors({}); // Reset errors
    
        try {
            if (editingLoan) {
                await axios.put(`${BASE_URL}/loans/${editingLoan.control_number}/`, loanData);
            } else {
                const response = await axios.post(`${BASE_URL}/loans/`, loanData);
                setNewLoan(response.data);
                setShowPrintButton(true);
                setPopupMessage('Loan successfully created!');
                setShowPopup(true);

                // Hide the buttons after submission
                setLoanSubmitted(true);
            
                setTimeout(() => {
                    setShowPopup(false);
                }, 1000);
            }            
            fetchLoans();
        } catch (err) {
            console.error('Error saving loan:', err);
            setErrors('Error saving loan');
            setPopupMessage('Failed to create loan. Please try again.');
            setShowPopup(true);
        }
    };
    const closePopup = () => {
        setShowPopup(false);
    };

    const handleDateFilter = () => {
        let filtered = loans;
    
        if (filter === "today") {
            const today = new Date().toISOString().split('T')[0];
            filtered = loans.filter((loan) => loan.loan_date === today);
        } else if (filter === "single-day") {
            if (selectedDate) {
                filtered = loans.filter((loan) => loan.loan_date === selectedDate);
            }
        } else if (filter === "date-range") {
            if (startDate && endDate) {
                filtered = loans.filter(
                    (loan) => loan.loan_date >= startDate && loan.loan_date <= endDate
                );
            }
        }
    
        // If no loans are found, show the pop-up message
        if (filtered.length === 0) {
            setShowNoLoanPopup(true); // Show pop-up message
        } else {
            setShowNoLoanPopup(false); // Hide pop-up message
        }
    
        // Set the filtered loans for display
        setFilteredLoans(filtered);
    };

    const resetForm = () => {
        setLoanData({
            control_number: '',
            account: '',
            loan_amount: '',
            loan_period: '',
            loan_period_unit: 'months',
            loan_type: 'Emergency',
            purpose: 'Education',
            status: 'Ongoing',
        });
        setFormVisible(false);
        setEditingLoan(null);
        setShowPrintButton(false);
        setNewLoan(null);
        setPaymentFormVisible(false);
        setSelectedLoanForPayment(null);
    };

return (
    <div className="loan-manager">
        <h2 className="loan-manager-header">LOAN MANAGEMENT</h2>

        {!formVisible && !paymentFormVisible && (
    <div className="search-container">
        <div className="search-wrapper" style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
            {/* Search Input */}
            <input
                type="text"
                placeholder="Search Loans"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
                style={{
                    padding: '7px 40px 10px 10px',
                    fontSize: '16px',
                    border: '0px',
                    borderRadius: '4px',
                    width: '250px',
                    marginBottom: '30px',
                    marginTop: '-10px',
                    marginLeft: '900px',
                }}
            />
        
            {/* Filter Icon */}
            <div
                onClick={() => setShowFilterOptions(!showFilterOptions)} // Toggle the filter options
                className="date-filter-icon"
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    fontSize: '20px',
                    marginBottom: '30px',
                    marginTop: '-10px',
                    marginLeft: '10px',
                }}
            >
                <span style={{ marginRight: '5px' }}>Range</span>
                <TbFilterEdit />
            </div>

            {/* Filter Options Dropdown */}
            {showFilterOptions && (
                <div
                    className="filter-options"
                    style={{
                        position: 'absolute',
                        top: '40px',
                        left: '1085px',
                        backgroundColor: 'white',
                        boxShadow: '0px 0px 15px 0px rgb(154, 154, 154)',
                        borderRadius: '4px',
                        padding: '10px',
                        zIndex: 100,
                        width: '150px',
                    }}
                >
                    <button
                        onClick={() => {
                            setFilter('today');
                            handleDateFilter();
                            setShowFilterOptions(false); // Close dropdown when "Today" is selected
                        }}
                        className={`filter-button ${filter === 'today' ? 'selected-filter' : ''}`}
                        style={{
                            color: filter === 'today' ? 'green' : 'inherit',
                            backgroundColor: 'transparent',
                            border: 'none',
                            padding: '5px 10px',
                            cursor: 'pointer',
                        }}
                    >
                        Today
                    </button>
                    <button
                        onClick={() => {
                            setFilter('single-day');
                            setShowFilterOptions(true); // Keep dropdown open for "Single Day"
                        }}
                        className={`filter-button ${filter === 'single-day' ? 'selected-filter' : ''}`}
                        style={{
                            color: filter === 'single-day' ? 'green' : 'inherit',
                            backgroundColor: 'transparent',
                            border: 'none',
                            padding: '5px 10px',
                            cursor: 'pointer',
                        }}
                    >
                        Single Day
                    </button>
                    <button
                        onClick={() => {
                            setFilter('date-range');
                            setShowFilterOptions(true); // Keep dropdown open for "Date Range"
                        }}
                        className={`filter-button ${filter === 'date-range' ? 'selected-filter' : ''}`}
                        style={{
                            color: filter === 'date-range' ? 'green' : 'inherit',
                            backgroundColor: 'transparent',
                            border: 'none',
                            padding: '5px 10px',
                            cursor: 'pointer',
                        }}
                    >
                        Date Range
                    </button>

                    {/* Automatically show All Date */}
                    <button 
                        onClick={() => {
                            setFilter('all-date');
                            handleDateFilter(); // Display all data without needing to click again
                            setShowFilterOptions(false); // Close dropdown
                        }} 
                        className={`filter-button ${filter === 'all-date' ? 'selected-filter' : ''}`}
                        style={{
                            color: filter === 'all-date' ? 'green' : 'inherit',
                            backgroundColor: 'transparent',
                            border: 'none',
                            padding: '5px 10px',
                            cursor: 'pointer',
                            marginTop: '10px',
                        }}
                    >
                        All Date
                    </button>

                    {/* Date Picker for Single Day */}
                    {filter === "single-day" && (
                        <>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="date-input"
                                placeholder="Select a Date"
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                                <button 
                                    onClick={() => { 
                                        if (selectedDate) {
                                            handleDateFilter(); 
                                        } else {
                                            setFilter('all-date'); // Automatically reset to "All Date"
                                            handleDateFilter(); // Display all data
                                        }
                                        setShowFilterOptions(false); // Close dropdown after applying filter
                                    }} 
                                    className="apply-filter-button"
                                >
                                    Apply
                                </button>
                                <button 
                                    onClick={() => { 
                                        setFilter('all-date'); // Automatically reset to "All Date"
                                        setSelectedDate(""); // Reset selected date
                                        handleDateFilter(); // Display all data
                                        setShowFilterOptions(false); // Close dropdown on cancel
                                    }} 
                                    className="cancel-filter-button"
                                    style={{
                                        color: 'red',
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </>
                    )}

                    {/* Date Range Inputs */}
                    {filter === "date-range" && (
                        <>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="date-input"
                                placeholder="Start Date"
                            />
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="date-input"
                                placeholder="End Date"
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                                <button 
                                    onClick={() => { 
                                        if (startDate && endDate) {
                                            handleDateFilter(); 
                                        } else {
                                            setFilter('all-date'); // Automatically reset to "All Date"
                                            handleDateFilter(); // Display all data
                                        }
                                        setShowFilterOptions(false); // Close dropdown after applying filter
                                    }} 
                                    className="apply-filter-button"
                                >
                                    Apply
                                </button>
                                <button 
                                    onClick={() => { 
                                        setFilter('all-date'); // Automatically reset to "All Date"
                                        setStartDate(""); 
                                        setEndDate(""); 
                                        handleDateFilter(); // Display all data
                                        setShowFilterOptions(false); // Close dropdown on cancel
                                    }} 
                                    className="cancel-filter-button"
                                    style={{
                                        color: 'red',
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Pop-up message when no loan is found */}
            {showNoLoanPopup && (
                <div className="popup" style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    padding: '20px',
                    background:' rgba(0, 0, 0, 0.5)',
                    borderRadius: '5px',
                    boxShadow: '0px 0px 20px 0px rgb(154, 154, 154)',
                    background:' #bbbbbb',
                    zIndex: 2000,
                }}>
                    <p>There's no loan made on this date.</p>
                    <button 
                        onClick={() => { 
                            setShowNoLoanPopup(false); // Close the pop-up
                            setFilter('all-date'); // Reset to "All Date"
                            handleDateFilter(); // Automatically show all data
                        }} 
                        style={{
                            backgroundColor: 'green',
                            color: 'black',
                            border: 'none',
                            padding: '10px 20px',
                            cursor: 'pointer',
                            justifyContentContent: 'center'
                        }}
                    >
                        Ok
                    </button>
                </div>
            )}

            {/* Display the filtered loans */}
            <div>
                {filteredLoans.map(loan => (
                    <div key={loan.id}>
                        {/* Render loan details */}
                    </div>
                ))}
            </div>
        </div>
    </div>
)}
        <div style={{ position: 'relative', marginBottom: '10px' }}>
            {!formVisible && (
                <button
                    onClick={() => setFormVisible(true)}
                    style={{
                        backgroundColor: '#28a745',
                        color: 'black',
                        padding: '10px 20px',
                        border: '0px',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        position: 'relative', 
                        marginLeft: '-5px', 
                        marginTop: '-55px',
                        position: 'fixed'
                    }}
                >
                    <AiOutlineUsergroupAdd /> Add Loan
                </button>
            )}
        </div>

        {formVisible && (
            <form onSubmit={handleLoanSubmit} className="loan-form">
                <h3 className="form-header">Create Loan</h3>
                <div className="form-row">
                    
                <div className="form-group">
                    <label>Account</label>
                    <select
                        name="search_option"
                        value={searchOption}
                        onChange={(e) => setSearchOption(e.target.value)}
                        className="form-control"
                    >
                        <option value="accountNumber">Account Number</option>
                        <option value="accountHolder">Account Holder</option>
                    </select>
                </div>

             {/* Conditionally show input field based on selection */}
             {searchOption === 'accountNumber' && (
                <div className="form-group">
                    <label>Enter Account Number</label>
                    <input
                        type="text"
                        name="account_number"
                        value={loanData.account}
                        onChange={(e) => setLoanData({ ...loanData, account: e.target.value })}
                        className="form-control"
                        placeholder="Enter Account Number"
                        />
                    </div>
                )} 

                {searchOption === 'accountHolder' && (
                    <div className="form-group">
                        <label>Enter Account Holder's Name</label>
                        <input
                        type="text"
                        name="account_holder"
                        value={loanData.account_holder}
                        onChange={(e) => setLoanData({ ...loanData, account_holder: e.target.value })}
                        className="form-control"
                        placeholder="Enter Account Holder's Name"
                        />
                    </div>
                )}
        
        <div className="form-group">
                    <label>Loan Type</label>
                        <select
                            name="loan_type"
                            className="form-control"
                            value={loanData.loan_type}
                            onChange={(e) => setLoanData({ ...loanData, loan_type: e.target.value })}
                        >
                            <option value="Regular">Regular</option>
                            <option value="Emergency">Emergency</option>
                        </select>
                    </div>

                    <div className="form-group">
                    <label>Loan Amount</label>
                    <input
                        type="text"
                        name="loan_amount"
                        value={formatNumber(loanData.loan_amount)}
                        onChange={(e) => {
                            const rawValue = e.target.value.replace(/,/g, "");
                            if (!isNaN(rawValue)) {
                                setLoanData({ ...loanData, loan_amount: rawValue });
                            }
                        }}
                        onBlur={(e) => {
                            const formattedValue = formatNumber(loanData.loan_amount);
                            e.target.value = formattedValue;
                        }}
                        required
                        className="form-control"
                        placeholder="Loan Amount"
                    />
                </div>

                    <div className="form-group">
                    <label>Loan Term</label>
                        <input
                            type="number"
                            name="loan_period"
                            value={loanData.loan_period}
                            onChange={(e) => setLoanData({ ...loanData, loan_period: e.target.value })}
                            required
                            className="form-control"
                            placeholder="Loan Term"
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Loan Term Unit:</label>
                        <select
                            name="loan_period_unit"
                            value={loanData.loan_period_unit}
                            onChange={(e) =>
                                setLoanData({ ...loanData, loan_period_unit: e.target.value })
                            }
                            required
                            className="form-control"
                        >
                            <option value="months">Months</option>
                            <option value="years">Years</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Purpose:</label>
                        <select
                            name="purpose"
                            value={loanData.purpose}
                            onChange={(e) => {
                                const selectedValue = e.target.value;
                                setLoanData({ ...loanData, purpose: selectedValue });
                                setShowOtherPurpose(selectedValue === "Others");
                            }}
                            className="form-control"
                        >
                            <option value="Education">Education</option>
                            <option value="Medical/Emergency">Medical/Emergency</option>
                            <option value="House Construction">House Construction</option>
                            <option value="Commodity/Appliances">Commodity/Appliances</option>
                            <option value="Utility Services">Utility Services</option>
                            <option value="Others">Others</option>
                        </select>
                    </div>

                    {showOtherPurpose && (
                        <div className="form-group">
                            <label>Other Purpose:</label>
                            <input
                                type="text"
                                placeholder="Specify other Purpose"
                                value={loanData.otherPurpose || ''}
                                onChange={(e) =>
                                    setLoanData({ ...loanData, otherPurpose: e.target.value })
                                }
                                className="form-control"
                            />
                        </div>
                    )}

                    {/* Check if loan amount is 1 million or below */}
                    {parseInt(loanData.loan_amount) <= 999999 && (
                    <>
                        <div className="form-group d-flex justify-content-between">
                            <div className="flex-fill mr-2">
                                <label>Co Maker 1</label>
                                <input
                                    type="text"
                                    placeholder="Enter Co Maker"
                                    value={loanData.co_make || ''}
                                    onChange={(e) =>
                                        setLoanData({ ...loanData, co_make: e.target.value })
                                    }
                                    className="form-control"
                                />
                            </div>

                            <div className="flex-fill">
                                <label>Relationship with Co Maker 1</label>
                                <input
                                    type="text"
                                    placeholder="Enter Relationship"
                                    value={loanData.relationships || ''}
                                    onChange={(e) =>
                                        setLoanData({ ...loanData, relationships: e.target.value })
                                    }
                                    className="form-control"
                                />
                            </div>
                        </div>

                        <div className="form-group d-flex justify-content-between">
                            <div className="flex-fill mr-2">
                                <label>Co Maker 2</label>
                                <input
                                    type="text"
                                    placeholder="Enter Co Maker"
                                    value={loanData.co_make_2 || ''}
                                    onChange={(e) =>
                                        setLoanData({ ...loanData, co_make_2: e.target.value })
                                    }
                                    className="form-control"
                                />
                            </div>

                            <div className="flex-fill">
                                <label>Relationship with Co Maker 2</label>
                                <input
                                    type="text"
                                    placeholder="Enter Relationship"
                                    value={loanData.relationship_2 || ''}
                                    onChange={(e) =>
                                        setLoanData({ ...loanData, relationship_2: e.target.value })
                                    }
                                    className="form-control"
                                />
                            </div>
                        </div>

                        <div className="form-group d-flex justify-content-between">
                            <div className="flex-fill mr-2">
                                <label>Co Maker 3</label>
                                <input
                                    type="text"
                                    placeholder="Enter Co Maker"
                                    value={loanData.co_make_3 || ''}
                                    onChange={(e) =>
                                        setLoanData({ ...loanData, co_make_3: e.target.value })
                                    }
                                    className="form-control"
                                />
                            </div>

                            <div className="flex-fill">
                                <label>Relationship with Co Maker 3</label>
                                <input
                                    type="text"
                                    placeholder="Enter Relationship"
                                    value={loanData.relationship_3 || ''}
                                    onChange={(e) =>
                                        setLoanData({ ...loanData, relationship_3: e.target.value })
                                    }
                                    className="form-control"
                                />
                            </div>
                        </div>
                    </>
                )}

                {/* Check if loan amount is 1 million or above */}
                {parseInt(loanData.loan_amount) >= 1000000 && (
                    <>
                        <div className="form-group d-flex justify-content-between">
                            <div className="flex-fill mr-2">
                                <label>Co Maker 1</label>
                                <input
                                    type="text"
                                    placeholder="Enter Co Maker"
                                    value={loanData.co_make || ''}
                                    onChange={(e) =>
                                        setLoanData({ ...loanData, co_make: e.target.value })
                                    }
                                    className="form-control"
                                />
                            </div>

                            <div className="flex-fill">
                                <label>Relationship with Co Maker 1</label>
                                <input
                                    type="text"
                                    placeholder="Enter Relationship"
                                    value={loanData.relationships || ''}
                                    onChange={(e) =>
                                        setLoanData({ ...loanData, relationships: e.target.value })
                                    }
                                    className="form-control"
                                />
                            </div>
                        </div>

                        <div className="form-group d-flex justify-content-between">
                            <div className="flex-fill mr-2">
                                <label>Co Maker 2</label>
                                <input
                                    type="text"
                                    placeholder="Enter Co Maker"
                                    value={loanData.co_make_2 || ''}
                                    onChange={(e) =>
                                        setLoanData({ ...loanData, co_make_2: e.target.value })
                                    }
                                    className="form-control"
                                />
                            </div>

                            <div className="flex-fill">
                                <label>Relationship with Co Maker 2</label>
                                <input
                                    type="text"
                                    placeholder="Enter Relationship"
                                    value={loanData.relationship_2 || ''}
                                    onChange={(e) =>
                                        setLoanData({ ...loanData, relationship_2: e.target.value })
                                    }
                                    className="form-control"
                                />
                            </div>
                        </div>

                        <div className="form-group d-flex justify-content-between">
                            <div className="flex-fill mr-2">
                                <label>Co Maker 3</label>
                                <input
                                    type="text"
                                    placeholder="Enter Co Maker"
                                    value={loanData.co_make_3 || ''}
                                    onChange={(e) =>
                                        setLoanData({ ...loanData, co_make_3: e.target.value })
                                    }
                                    className="form-control"
                                />
                            </div>

                            <div className="flex-fill">
                                <label>Relationship with Co Maker 3</label>
                                <input
                                    type="text"
                                    placeholder="Enter Relationship"
                                    value={loanData.relationship_3 || ''}
                                    onChange={(e) =>
                                        setLoanData({ ...loanData, relationship_3: e.target.value })
                                    }
                                    className="form-control"
                                />
                            </div>
                        </div>
                        <div className="form-group d-flex justify-content-between">
                            <div className="flex-fill mr-2">
                                <label>Co Maker 4</label>
                                <input
                                    type="text"
                                    placeholder="Enter Co Maker"
                                    value={loanData.co_make_4 || ''}
                                    onChange={(e) =>
                                        setLoanData({ ...loanData, co_make_4: e.target.value })
                                    }
                                    className="form-control"
                                />
                            </div>

                            <div className="flex-fill">
                                <label>Relationship with Co Maker 4</label>
                                <input
                                    type="text"
                                    placeholder="Enter Relationship"
                                    value={loanData.relationship_4 || ''}
                                    onChange={(e) =>
                                        setLoanData({ ...loanData, relationship_4: e.target.value })
                                    }
                                    className="form-control"
                                />
                            </div>
                        </div>
                        <div className="form-group d-flex justify-content-between">
                            <div className="flex-fill mr-2">
                                <label>Co Maker 5</label>
                                <input
                                    type="text"
                                    placeholder="Enter Co Maker"
                                    value={loanData.co_make_5 || ''}
                                    onChange={(e) =>
                                        setLoanData({ ...loanData, co_make_5: e.target.value })
                                    }
                                    className="form-control"
                                />
                            </div>

                            <div className="flex-fill">
                                <label>Relationship with Co Maker 5</label>
                                <input
                                    type="text"
                                    placeholder="Enter Relationship"
                                    value={loanData.relationship_5 || ''}
                                    onChange={(e) =>
                                        setLoanData({ ...loanData, relationship_5: e.target.value })
                                    }
                                    className="form-control"
                                />
                            </div>
                        </div>
                    </>
                )}
                </div>

                {!loanSubmitted && (
                    <>
                        <button type="submit" className="form-submit">
                            {editingLoan ? 'Update Loan' : 'Create Loan'}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                resetForm();
                                setFormVisible(false);
                            }}
                            className="form-cancel"
                        >
                            Cancel
                        </button>
                    </>
                )}
            </form>
        )}
        {/* Popup Modal */}
        {showPopup && (
            <div className="popup-overlay">
            <div className="popup-box">
            <div className="popup">
                <p>{popupMessage}</p>
            </div>
        <ul>
        {Object.values(errors).map((error, index) => (
            <li key={index} className="error-text">
        {error}
            </li>
        ))}
        </ul>
            <button onClick={closePopup} className="close-btn">OK</button>
            </div>
        </div>
        )}

        {!formVisible && !paymentFormVisible && (
            <div className="loan-table-container">
                <table className="loan-table">
                    <thead>
                        <tr>
                            <th>Control Number</th>
                            <th>Account Number</th>
                            <th>Account Holder</th>
                            <th>Loan Type</th>
                            <th>Loan Amount</th>
                            <th>Service Fee</th>
                            <th>Interest Amount</th>
                            <th>Admin Cost</th>
                            <th>Notarial Fee</th>
                            <th>CISP</th>
                            <th>TakeHome</th>
                            <th>Outstanding<br/>
                            Balance</th>
                            <th>Purpose</th>
                            <th>Status</th>
                            {/* <th>Actions</th> */}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLoans.map((loan) => (
                            <tr key={loan.control_number}>
                                <td>{loan.control_number}</td>
                                <td style={{ position: 'relative', color: 'blue', cursor: 'pointer' }}>{loan.account || 'N/A'}</td>
                                <td>{loan.account_holder || 'N/A'}</td>
                                <td>{loan.loan_type}</td>
                                <td>{formatNumber(loan.loan_amount)}</td>
                                <td>{formatNumber(loan.service_fee)}</td>
                                <td>{formatNumber(loan.interest_amount)}</td>
                                <td>{formatNumber(loan.admincost)}</td>
                                <td>{formatNumber(loan.notarial)}</td>
                                <td>{formatNumber(loan.cisp)}</td>
                                <td>{formatNumber(loan.takehomePay)}</td>
                                <td>{formatNumber(loan.outstanding_balance)}</td>
                                <td>{loan.purpose}</td>
                                <td>{loan.status}</td>
                                <td>
                                    {/* <button
                                        onClick={() => {
                                            setEditingLoan(loan);
                                            setFormVisible(true);
                                        }}
                                        className="action-button edit-button"
                                    >
                                        <FaEdit />
                                    </button> */}
                                    {/* <button
                                        onClick={() => handlePayLoan(loan)}
                                        className="action-button pay-button"
                                    >
                                        <FaDollarSign />
                                    </button> */}
                                    {/* <button
                                        onClick={() => handleDeleteLoan(loan)}
                                        className="action-button delete-button"
                                    >
                                        <FaTrash />
                                    </button> */}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
 
        {showPrintButton && newLoan && (
            <div className="buttons-container">
                
                <button
                    className="print-button"
                    style={{
                        backgroundColor: "#4CAF50", 
                        color: "black",
                        border: '0px',
                        textAlign: "center",
                        textDecoration: "none",
                        display: "inline-block",
                        fontSize: "16px",
                        cursor: "pointer",
                        borderRadius: "5px",
                        marginLeft: '5px',
                        marginTop: '5px'

                    }}
                    
                    onClick={async () => {
                        console.log(newLoan.account_holder);

                        const printContent = `
                        <div style="border: 2px solid #000; padding: 20px; width: fit-content; margin: 0 auto;">
                            <h1>Loan Details</h1>  
                            <p><strong>Control Number:</strong> ${newLoan.control_number}</p>
                            <p><strong>Account:</strong> ${newLoan.account}</p>
                            <p><strong>Amount:</strong> ${newLoan.loan_amount}</p>
                            <p><strong>Type:</strong> ${newLoan.loan_type}</p>
                            <p><strong>Interest Rate:</strong> ${newLoan.interest_rate}</p>
                            <p><strong>Loan Period:</strong> ${newLoan.loan_period} ${newLoan.loan_period_unit}</p>
                            <p><strong>Loan Date:</strong> ${newLoan.loan_date}</p>
                            <p><strong>Due Date:</strong> ${newLoan.due_date}</p>
                            <p><strong>Status:</strong> ${newLoan.status}</p>
                            <p><strong>Service Fee:</strong> ${newLoan.service_fee}</p>
                            <p><strong>Take Home Pay:</strong> ${newLoan.takehomePay}</p>
                            <p><strong>Penalty Rate:</strong> ${newLoan.penalty_rate}</p>
                            <p><strong>Purpose:</strong> ${newLoan.purpose}</p>

                            <div style="text-align: center; margin-top: 70px;">
                            <p style="width: 200px; border-bottom: 2px solid black; margin: 0 auto;"></p>
                            <p><strong>Member Signature</strong></p>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-top: 60px;">
                            <div style="text-align: center; flex: 1;">
                                <p style="width: 200px; border-bottom: 2px solid black; margin: 0 auto;"></p>
                                <p><strong>Signature Verified By</strong></p>
                            </div>

                            <div style="text-align: center; flex: 1;">
                                <p style="width: 200px; border-bottom: 2px solid black; margin: 0 auto;"></p>
                                <p><strong>Approved By</strong></p>
                            </div>
                            </div>
                        </div>
                        `;

                        const printWindow = window.open('', '_blank');
                        printWindow.document.write(`
                            <html>
                                <head>
                                    <title>Print Loan Details</title>
                                    <style>
                                        body { font-family: Arial, sans-serif; padding: 20px; }
                                        h1 { color: black; }
                                        p { font-size: 16px; }
                                    </style>
                                </head>
                                <body>
                                    ${printContent}
                                </body>
                            </html>
                        `);
                        printWindow.document.close();

                        printWindow.onload = function () {
                            printWindow.print();
                        };

                        resetForm();
                    }}
                >
                    Print Loan Details
                </button>
                <button
                    className="cancel-button"
                    style={{
                        backgroundColor: "#f44336", 
                        color: "black",
                        border: '0px',
                        textAlign: "center",
                        textDecoration: "none",
                        display: "inline-block",
                        fontSize: "16px",
                        cursor: "pointer",
                        borderRadius: "5px",
                        marginRight: '500px'
                    }}
                    onClick={resetForm}
                >
                    Cancel
                </button>
            </div>
        )}
        </div>
    );
};

export default LoanManager;