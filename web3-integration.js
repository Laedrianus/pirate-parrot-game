// Web3 Integration Variables
let web3;
let contract;
let userAccount;

// Blocksense Contract Address and ABI
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

// Pharos RPC URL
const PHAROS_RPC_URL = "https://testnet.dplabs-internal.com";
const CHAIN_ID = 688688;

// Connect to Web3
async function connectToWeb3() {
    try {
        // Check for MetaMask
        if (window.ethereum) {
            web3 = new Web3(window.ethereum);
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            
            // Get user account
            const accounts = await web3.eth.getAccounts();
            userAccount = accounts[0];
            
            // Create contract instance
            contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
            
            console.log("Web3 connected successfully");
            return true;
        } else {
            // Fallback: HTTP provider
            web3 = new Web3(new Web3.providers.HttpProvider(PHAROS_RPC_URL));
            contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
            
            console.log("Web3 connected via HTTP provider");
            return true;
        }
    } catch (error) {
        console.error("Web3 connection error:", error);
        return false;
    }
}

// Submit Score to Blockchain
async function submitScoreToBlockchain(score) {
    try {
        // First connect to Web3
        if (!web3 || !contract) {
            const connected = await connectToWeb3();
            if (!connected) {
                throw new Error("Failed to connect to Web3");
            }
        }
        
        // Update user account
        const accounts = await web3.eth.getAccounts();
        userAccount = accounts[0];
        
        // Get gas price
        const gasPrice = await web3.eth.getGasPrice();
        
        // Prepare transaction
        const tx = {
            from: userAccount,
            to: CONTRACT_ADDRESS,
            gas: 200000,
            gasPrice: gasPrice,
             contract.methods.submitScore(score).encodeABI()
        };
        
        // Send transaction
        const txReceipt = await web3.eth.sendTransaction(tx);
        
        return {
            success: true,
            txHash: txReceipt.transactionHash
        };
    } catch (error) {
        console.error("Blockchain submission error:", error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Get Player Score from Blockchain
async function getPlayerScoreFromBlockchain(playerAddress) {
    try {
        // First connect to Web3
        if (!web3 || !contract) {
            const connected = await connectToWeb3();
            if (!connected) {
                throw new Error("Failed to connect to Web3");
            }
        }
        
        // Get score
        const score = await contract.methods.getPlayerScore(playerAddress).call();
        return parseInt(score);
    } catch (error) {
        console.error("Get player score error:", error);
        return null;
    }
}

// Get Leaderboard from Blockchain
async function getLeaderboardFromBlockchain() {
    try {
        // This function would be used if the contract had a leaderboard function
        // Currently not implemented in our contract
        console.log("Leaderboard function not implemented in current contract");
        return [];
    } catch (error) {
        console.error("Get leaderboard error:", error);
        return [];
    }
}

// Connect to Web3 on page load
window.addEventListener('load', async () => {
    // Try to connect to Web3
    await connectToWeb3();
});