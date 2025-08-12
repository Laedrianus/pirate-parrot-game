let web3;
let contract;
let userAccount;

const CONTRACT_ADDRESS = "0x15A96966a7003bfc63B58ee9658418DB72D3974D";
const CONTRACT_ABI = [
    {
        "inputs": [{"internalType": "uint256", "name": "score", "type": "uint256"}],
        "name": "submitScore",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "address", "name": "player", "type": "address"},
            {"internalType": "address", "name": "", "type": "address"}
        ],
        "name": "latestRoundData",
        "outputs": [
            {"internalType": "uint80", "name": "roundId", "type": "uint80"},
            {"internalType": "int256", "name": "answer", "type": "int256"},
            {"internalType": "uint256", "name": "startedAt", "type": "uint256"},
            {"internalType": "uint256", "name": "updatedAt", "type": "uint256"},
            {"internalType": "uint80", "name": "answeredInRound", "type": "uint80"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "address", "name": "player", "type": "address"}],
        "name": "getPlayerScore",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    }
];

const PHAROS_RPC_URL = "https://testnet.dplabs-internal.com";

async function connectToWeb3Interactive() {
    try {
        if (window.ethereum) {
            web3 = new Web3(window.ethereum);
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            if (!accounts || accounts.length === 0) {
                throw new Error('No accounts returned');
            }
            userAccount = accounts[0];
            contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
            return { success: true, account: userAccount };
        } else {
            web3 = new Web3(new Web3.providers.HttpProvider(PHAROS_RPC_URL));
            contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
            return { success: false, error: 'MetaMask not detected' };
        }
    } catch (err) {
        console.error('Connection error:', err);
        return { success: false, error: err.message || String(err) };
    }
}

function initReadOnlyWeb3() {
    if (!web3) {
        try {
            web3 = window.ethereum
                ? new Web3(window.ethereum)
                : new Web3(new Web3.providers.HttpProvider(PHAROS_RPC_URL));
            contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
        } catch (err) {
            console.error('Init error:', err);
        }
    }
}

async function submitScoreToBlockchain(score) {
    try {
        if (!web3 || !contract) initReadOnlyWeb3();

        const accounts = await web3.eth.getAccounts();
        if (!accounts || accounts.length === 0) {
            return { success: false, error: 'Wallet not connected' };
        }
        userAccount = accounts[0];

        let gas = 200000;
        try {
            gas = await contract.methods.submitScore(score).estimateGas({ from: userAccount });
        } catch (e) {
            console.warn("Gas estimate failed, using fallback");
        }

        const tx = await contract.methods.submitScore(score).send({
            from: userAccount,
            gas: Math.min(gas + 10000, 500000)
        });

        return { success: true, txHash: tx.transactionHash };
    } catch (error) {
        console.error('Submit error:', error);
        return { success: false, error: error.message || "Transaction failed" };
    }
}

// Globala aç
window.connectToWeb3Interactive = connectToWeb3Interactive;
window.submitScoreToBlockchain = submitScoreToBlockchain;
window.initReadOnlyWeb3 = initReadOnlyWeb3;

// Sayfa yüklendiğinde readonly başlat
window.addEventListener('load', initReadOnlyWeb3);