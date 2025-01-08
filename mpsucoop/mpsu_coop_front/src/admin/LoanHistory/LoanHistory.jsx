import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { AiOutlineUsergroupAdd } from "react-icons/ai";
import { FaTrash, FaDollarSign, FaSearch } from 'react-icons/fa';
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
    const [error, setError] = useState(null);
    const [paymentFormVisible, setPaymentFormVisible] = useState(false);
    const [selectedLoanForPayment, setSelectedLoanForPayment] = useState(null);
    const [showPrintButton, setShowPrintButton] = useState(false);
    const [newLoan, setNewLoan] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showOtherPurpose, setShowOtherPurpose] = useState(false);


    const BASE_URL = 'http://localhost:8000';
    const navigate = useNavigate();

    // Fetch loans
    const fetchLoans = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/loans/`);
            setLoans(response.data);
        } catch (err) {
            console.error('Error fetching loans:', err.response || err);
            setError('Error fetching loans');
        }
    };

    useEffect(() => {
        fetchLoans();
    }, []);

    const filteredLoans = loans.filter((loan) =>
        `${loan.account}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loan.loan_type.toString().includes(searchQuery)
    );


    // Fetch members from API
    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const response = await fetch('/api/member'); 
                if (!response.ok) {
                    throw new Error('Failed to fetch members');
                }
                const data = await response.json();
                console.log('Fetched members:', data); // Debug log
                setMembers(data); // Update state with members
            } catch (error) {
                console.error('Error fetching members:', error);
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
    
        // Check if the loan type is "Emergency" and the loan period exceeds 6 months
        if (loanData.loan_type === 'Emergency' && loanData.loan_period > 6) {
            alert("Emergency loans cannot exceed 6 months.");
            return; // Stop the form submission
        }
    
        // Check if the loan type is "Regular" and the loan amount exceeds 1.5 million
        if (loanData.loan_type === 'Regular' && loanData.loan_amount > 1500000) {
            alert("Regular loans cannot exceed 1.5 million.");
            return; // Stop the form submission
        }
    
        // Check if the loan type is "Emergency" and the loan amount exceeds 50 thousand
        if (loanData.loan_type === 'Emergency' && loanData.loan_amount > 50000) {
            alert("Emergency loans cannot exceed 50,000.");
            return; // Stop the form submission
        }
    
        try {
            if (editingLoan) {
                await axios.put(`${BASE_URL}/loans/${editingLoan.control_number}/`, loanData);
            } else {
                const response = await axios.post(`${BASE_URL}/loans/`, loanData);
                setNewLoan(response.data);
                setShowPrintButton(true);
            }
            fetchLoans();
        } catch (err) {
            console.error('Error saving loan:', err);
            setError('Error saving loan');
        }
    };
    
    
    
    const handleDeleteLoan = async (loan) => {
        if (loan.status !== "Fully Paid") {
            alert("This loan cannot be deleted as it is not fully paid.");
            return;
        }

        const confirmDelete = window.confirm(
            `Are you sure you want to delete the loan with Control Number: ${loan.control_number}? This action cannot be undone.`
        );

        if (!confirmDelete) return;

        try {
            await axios.delete(`${BASE_URL}/loans/${loan.control_number}/`);
            alert("Loan deleted successfully.");
            fetchLoans();
        } catch (err) {
            console.error('Error deleting loan:', err);
            alert(
                `Failed to delete the loan. ${
                    err.response?.data?.message || "Please try again later."
                }`
            );
        }
    }; 

    // Handle loan payment and redirect to payment schedule
    const handlePayLoan = (loan) => {
        setSelectedLoanForPayment(loan);
        setPaymentFormVisible(true);

        // Redirect to payment-schedules page
        navigate('/payment-schedules'); // Use navigate here
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
                <div className="search-wrapper">
                    <input
                        type="text"
                        placeholder="Search Loans"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                    <button
                        onClick={() => console.log('Search triggered')}
                        style={{
                            position: 'absolute',
                            top: '-10px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            backgroundColor: '#007bff',
                            color: 'black',
                            border: '2px solid #000000',
                            borderRadius: '4px',
                            padding: '10px',
                            marginLeft: '1215px',
                        }}
                    >
                        <FaSearch />
                    </button>
                </div>
            </div>
        )}
        <div style={{ position: 'relative', marginBottom: '20px' }}>
            {!formVisible && (
                <button
                    onClick={() => setFormVisible(true)}
                    style={{
                        backgroundColor: '#28a745',
                        color: 'black',
                        padding: '10px 20px',
                        border: '2px solid #000000',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        marginLeft: '1100px',
                    }}
                >
                    <AiOutlineUsergroupAdd /> Add Loan
                </button>
            )}
        </div>

        {formVisible && (
            <form onSubmit={handleLoanSubmit} className="loan-form">
                <h3 className="form-header">Create Loan</h3>

                {/* Member Name Input */}
                {/* <label>Member Name:</label>
                <input
                    type="text"
                    name="name"
                    value={loanData.name}
                    onChange={handleInputChange}
                    placeholder="Enter Member Name"
                    required
                    className="form-input"
                /> */}

                {/* Account Number (Auto-Populated) */}
                {/* <label>Account Number:</label>
                <input
                    type="text"
                    name="account"
                    value={loanData.account}
                    readOnly
                    placeholder="Account Number will auto-populate"
                    className="form-input form-input-readonly"
                /> */}

                <input
                    type="text"
                    placeholder="Account Number"
                    value={loanData.account}
                    onChange={(e) => setLoanData({ ...loanData, account: e.target.value })}
                    required
                />

                <label>Loan Amount:</label>
                <input
                    type="number"
                    name="loan_amount"
                    value={loanData.loan_amount}
                    onChange={(e) =>
                        setLoanData({ ...loanData, loan_amount: e.target.value })
                    }
                    required
                    className="form-input"
                />

                <label>Loan Term:</label>
                <input
                    type="number"
                    name="loan_period"
                    value={loanData.loan_period}
                    onChange={(e) =>
                        setLoanData({ ...loanData, loan_period: e.target.value })
                    }
                    required
                    className="form-input"
                />

                <label>Loan Term Unit:</label>
                <input
                    name="loan_period_unit"
                    value={loanData.loan_period_unit}
                    onChange={(e) =>
                        setLoanData({ ...loanData, loan_period_unit: e.target.value })
                    }
                    required
                    className="form-input"
                />

                <label>Loan Type:</label>
                <select
                    name="loan_type"
                    value={loanData.loan_type}
                    onChange={(e) =>
                        setLoanData({ ...loanData, loan_type: e.target.value })
                    }
                    className="form-input"
                >
                    <option value="Regular">Regular</option>
                    <option value="Emergency">Emergency</option>
                </select>

                <label>Purpose:</label>
                <select
                    name="purpose"
                    value={loanData.purpose}
                    onChange={(e) => {
                        const selectedValue = e.target.value;
                        setLoanData({ ...loanData, purpose: selectedValue });
                        setShowOtherPurpose(selectedValue === "Others");
                    }}
                    className="form-input"
                >
                    <option value="Education">Education</option>
                    <option value="Medical/Emergency">Medical/Emergency</option>
                    <option value="House Construction">House Construction</option>
                    <option value="Commodity/Appliances">Commodity/Appliances</option>
                    <option value="Utility Services">Utility Services</option>
                    <option value="Others">Others</option>
                </select>

                {showOtherPurpose && (
                    <input
                        type="text"
                        placeholder="Specify other Purpose"
                        value={loanData.otherPurpose || ''}
                        onChange={(e) =>
                            setLoanData({ ...loanData, otherPurpose: e.target.value })
                        }
                        className="form-input"
                    />
                )}

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
            </form>
        )}

        {!formVisible && !paymentFormVisible && (
            <div className="loan-table-container">
                <table className="loan-table">
                    <thead>
                        <tr>
                            <th>Control Number</th>
                            <th>Account Number</th>
                            <th>Account Holder</th>
                            <th>Loan Amount</th>
                            <th>Loan Type</th>
                            <th>Purpose</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLoans.map((loan) => (
                            <tr key={loan.control_number}>
                                <td>{loan.control_number}</td>
                                <td>{loan.account}</td>
                                <td>{loan.account_holder || 'N/A'}</td>
                                <td>{loan.loan_amount}</td>
                                <td>{loan.loan_type}</td>
                                <td>{loan.purpose}</td>
                                <td>{loan.status}</td>
                                <td>
                                    <button
                                        onClick={() => {
                                            setEditingLoan(loan);
                                            setFormVisible(true);
                                        }}
                                        className="action-button edit"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteLoan(loan)}
                                        className="action-button delete"
                                    >
                                        Delete
                                    </button>
                                    <button
                                        onClick={() => handlePayLoan(loan)}
                                        className="action-button pay"
                                    >
                                        Pay
                                    </button>
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
                        border: '2px solid #000000',
                        textAlign: "center",
                        textDecoration: "none",
                        display: "inline-block",
                        fontSize: "16px",
                        cursor: "pointer",
                        borderRadius: "5px",
                        marginLeft: '300px',
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
                        border: '2px solid #000000',
                        textAlign: "center",
                        textDecoration: "none",
                        display: "inline-block",
                        fontSize: "16px",
                        cursor: "pointer",
                        borderRadius: "5px",
                        marginRight: '300px'
                    }}
                    onClick={resetForm}
                >
                    Cancel
                </button>
                <p
                    style={{
                        fontSize: "18px",
                        color: "black",
                        fontWeight: "bold",
                        marginLeft: "300px",

                    }}
                >
                    Loan created successfully!
                </p>

            </div>
        )}
        </div>
    );
};

export default LoanManager;
