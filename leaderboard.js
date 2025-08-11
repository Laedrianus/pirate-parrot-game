// Leaderboard elementleri
const connectWalletButton = document.getElementById('connectWalletButton');
const walletStatus = document.getElementById('walletStatus');
const loadingMessage = document.getElementById('loadingMessage');
const leaderboardTable = document.getElementById('leaderboardTable');
const leaderboardBody = document.getElementById('leaderboardBody');

// Buton olayı
connectWalletButton.addEventListener('click', connectWallet);

// Cüzdan bağlama
async function connectWallet() {
    try {
        walletStatus.textContent = 'Connecting...';
        walletStatus.className = 'info';
        
        const connected = await connectToWeb3();
        
        if (connected) {
            walletStatus.textContent = `Connected: ${userAccount.substring(0, 10)}...${userAccount.substring(32)}`;
            walletStatus.className = 'success';
            
            // Liderlik tablosunu yükle
            await loadLeaderboard();
        } else {
            walletStatus.textContent = 'Failed to connect wallet';
            walletStatus.className = 'error';
        }
    } catch (error) {
        walletStatus.textContent = `Error: ${error.message}`;
        walletStatus.className = 'error';
    }
}

// Liderlik tablosunu yükle
async function loadLeaderboard() {
    try {
        loadingMessage.textContent = 'Loading leaderboard from blockchain...';
        
        // Örnek veri - gerçek uygulamada blockchain'den alınacak
        const leaderboardData = [
            { player: "0xAa0EA4048fb7Ab4847a35cD9d9889198F1e7128e", score: 500 },
            { player: "0x1234567890123456789012345678901234567890", score: 450 },
            { player: "0x0987654321098765432109876543210987654321", score: 400 }
        ];
        
        // Gerçek uygulamada:
        // const leaderboardData = await getLeaderboardFromBlockchain();
        
        displayLeaderboard(leaderboardData);
    } catch (error) {
        loadingMessage.textContent = `Error loading leaderboard: ${error.message}`;
        loadingMessage.className = 'error';
    }
}

// Liderlik tablosunu göster
function displayLeaderboard(data) {
    loadingMessage.classList.add('hidden');
    leaderboardTable.classList.remove('hidden');
    
    // Tabloyu temizle
    leaderboardBody.innerHTML = '';
    
    // Verileri sırala (büyükten küçüğe)
    data.sort((a, b) => b.score - a.score);
    
    // Tabloyu doldur
    data.forEach((entry, index) => {
        const row = document.createElement('tr');
        
        const rankCell = document.createElement('td');
        rankCell.textContent = index + 1;
        
        const playerCell = document.createElement('td');
        playerCell.textContent = `${entry.player.substring(0, 6)}...${entry.player.substring(36)}`;
        
        const scoreCell = document.createElement('td');
        scoreCell.textContent = entry.score;
        
        row.appendChild(rankCell);
        row.appendChild(playerCell);
        row.appendChild(scoreCell);
        
        leaderboardBody.appendChild(row);
    });
}

// Sayfa yüklendiğinde
window.addEventListener('load', () => {
    // Eğer zaten bağlıysa liderlik tablosunu yükle
    if (web3 && userAccount) {
        walletStatus.textContent = `Connected: ${userAccount.substring(0, 10)}...${userAccount.substring(32)}`;
        walletStatus.className = 'success';
        loadLeaderboard();
    }
});