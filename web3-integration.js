/* GLOBAL STATE */
let web3;
let contract;
let userAccount;

/* ====== CONFIG - ADRESİNİ BURAYA YAPISTIR ====== */
const CONTRACT_ADDRESS = "0xcbd34cde39ef893f2fbe305b50b8e6fe76e17f8c"; // <- DEĞİŞTİR
/* =============================================== */

const CONTRACT_ABI = [
  // submitScore(uint256)
  {
    "inputs":[{"internalType":"uint256","name":"score","type":"uint256"}],
    "name":"submitScore",
    "outputs":[],
    "stateMutability":"nonpayable",
    "type":"function"
  },
  // getPlayerScore(address)
  {
    "inputs":[{"internalType":"address","name":"player","type":"address"}],
    "name":"getPlayerScore",
    "outputs":[{"internalType":"uint256","name":"","type":"uint256"}],
    "stateMutability":"view",
    "type":"function"
  },
  // getTop10() returns (address[10], uint256[10])
  {
    "inputs":[],
    "name":"getTop10",
    "outputs":[
      {"internalType":"address[10]","name":"addrs","type":"address[10]"},
      {"internalType":"uint256[10]","name":"scores","type":"uint256[10]"}
    ],
    "stateMutability":"view",
    "type":"function"
  }
];

/* --------- CONNECT --------- */
async function connectToWeb3Interactive() {
  try {
    if (!window.ethereum) {
      return { success: false, error: "MetaMask not detected" };
    }
    // Web3.js kullanıyoruz (projene uyumlu)
    web3 = new Web3(window.ethereum);
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    if (!accounts || accounts.length === 0) throw new Error("No accounts");

    userAccount = accounts[0];
    contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
    return { success: true, account: userAccount };
  } catch (err) {
    console.error("connectToWeb3Interactive error:", err);
    return { success: false, error: err.message || String(err) };
  }
}

function initReadOnlyWeb3() {
  try {
    if (!web3) {
      if (window.ethereum) {
        web3 = new Web3(window.ethereum);
      } else {
        // Gerekirse kendi RPC'ni ver
        const PHAROS_RPC_URL = "https://testnet.dplabs-internal.com";
        web3 = new Web3(new Web3.providers.HttpProvider(PHAROS_RPC_URL));
      }
    }
    if (!contract) {
      contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
    }
  } catch (err) {
    console.error("initReadOnlyWeb3 error:", err);
  }
}

/* --------- WRITE: Submit Score --------- */
async function submitScoreToBlockchain(score) {
  try {
    if (!web3 || !contract) initReadOnlyWeb3();

    const accounts = await web3.eth.getAccounts();
    if (!accounts || accounts.length === 0) {
      return { success: false, error: "Wallet not connected" };
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
      gas: Math.min(gas + 20000, 600000)
    });

    return { success: true, txHash: tx.transactionHash };
  } catch (error) {
    console.error("submitScoreToBlockchain error:", error);
    return { success: false, error: error.message || "Transaction failed" };
  }
}

/* --------- READ: Leaderboard --------- */
async function getLeaderboardFromBlockchain() {
  try {
    if (!web3 || !contract) initReadOnlyWeb3();
    const result = await contract.methods.getTop10().call();
    const addrs = result[0];
    const scores = result[1];

    const rows = [];
    for (let i = 0; i < addrs.length; i++) {
      const addr = addrs[i];
      const sc = Number(scores[i]);
      if (addr && addr !== "0x0000000000000000000000000000000000000000" && sc > 0) {
        rows.push({ player: addr, score: sc });
      }
    }
    // büyükten küçüğe sıralı gelmesi gerekir; yine de sort edelim:
    rows.sort((a, b) => b.score - a.score);
    return { success: true, rows };
  } catch (err) {
    console.error("getLeaderboardFromBlockchain error:", err);
    return { success: false, error: err.message || String(err) };
  }
}

/* global export */
window.connectToWeb3Interactive = connectToWeb3Interactive;
window.submitScoreToBlockchain = submitScoreToBlockchain;
window.getLeaderboardFromBlockchain = getLeaderboardFromBlockchain;
window.initReadOnlyWeb3 = initReadOnlyWeb3;

/* readonly init */
window.addEventListener("load", initReadOnlyWeb3);
