require('dotenv').config();
const ethers = require('ethers');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

/**
 * HyperEVM Chain 999 Block Sync Manager
 * Network: HyperEVM Mainnet
 * Chain ID: 999
 */
class HyperEVMChain999SyncManager {
    constructor() {
        // Chain 999 Configuration
        this.chainId = 999;
        this.chainName = 'HyperEVM Mainnet';
        this.hexChainId = '0x3e7';
        
        // RPC Endpoints
        this.rpcEndpoint = process.env.HYPEREVM_MAINNET_RPC || 'https://rpc.hyperevm.io';
        this.ethRpcEndpoint = process.env.INFURA_API_URL_RPC_ETH;
        
        // Address Configuration
        this.infuraAddress = process.env.INFURA_ADDRESS;
        this.infuraApiSecret = process.env.INFURA_API_SECRET;
        
        // Providers
        this.provider = new ethers.providers.JsonRpcProvider(this.rpcEndpoint);
        this.ethProvider = this.ethRpcEndpoint ? new ethers.providers.JsonRpcProvider(this.ethRpcEndpoint) : null;
        
        // Sync Configuration
        this.syncInterval = parseInt(process.env.SYNC_INTERVAL) || 5000;
        this.updateInterval = 15 * 60 * 1000; // 15 minutes
        
        // Data Storage
        this.syncedBlocks = [];
        this.lastSyncedBlock = parseInt(process.env.START_BLOCK) || 0;
        
        // File Paths
        const dataDir = path.join(__dirname, 'data', 'hyperevm-chain-999');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        
        this.dataFile = path.join(dataDir, 'synced-blocks.json');
        this.statsFile = path.join(dataDir, 'sync-stats.json');
        this.addressDataFile = path.join(dataDir, 'address-data.json');
        this.addressHistoryFile = path.join(dataDir, 'address-history.json');
        this.submissionLogFile = path.join(dataDir, 'submission-log.json');
        this.networkInfoFile = path.join(dataDir, 'network-info.json');
    }

    /**
     * Initialize Sync Manager
     */
    async initialize() {
        try {
            console.log('\n🚀 ========== HyperEVM Chain 999 Sync Manager ==========');
            console.log(`\n📍 Chain Configuration:`);
            console.log(`   Chain Name: ${this.chainName}`);
            console.log(`   Chain ID: ${this.chainId}`);
            console.log(`   Hex Chain ID: ${this.hexChainId}`);
            console.log(`   RPC Endpoint: ${this.rpcEndpoint}`);
            console.log(`\n👤 Address Configuration:`);
            console.log(`   Infura Address: ${this.infuraAddress}`);
            console.log(`   Update Interval: Every 15 minutes`);
            
            // Verify chain connection
            const isConnected = await this.verifyChainConnection();
            if (!isConnected) {
                throw new Error('Failed to connect to HyperEVM Chain 999');
            }
            
            // Load previous data
            if (fs.existsSync(this.dataFile)) {
                const data = JSON.parse(fs.readFileSync(this.dataFile, 'utf8'));
                this.syncedBlocks = data;
                this.lastSyncedBlock = data.length > 0 ? data[data.length - 1].blockNumber : 0;
                console.log(`\n📦 Loaded ${this.syncedBlocks.length} previously synced blocks`);
            }

            // Get current block number
            const currentBlock = await this.provider.getBlockNumber();
            console.log(`⛓️  Current Block Number: ${currentBlock}`);
            console.log(`✅ Initialization Complete\n`);

        } catch (error) {
            console.error('❌ Initialization Error:', error.message);
            throw error;
        }
    }

    /**
     * Verify Chain Connection
     */
    async verifyChainConnection() {
        try {
            const network = await this.provider.getNetwork();
            
            if (network.chainId === this.chainId) {
                console.log(`✅ Connected to ${this.chainName} (Chain ID: ${network.chainId})`);
                return true;
            } else {
                console.error(`❌ Wrong chain. Expected: ${this.chainId}, Got: ${network.chainId}`);
                return false;
            }
        } catch (error) {
            console.error(`❌ Connection error: ${error.message}`);
            return false;
        }
    }

    /**
     * Get Network Information
     */
    async getNetworkInfo() {
        try {
            const network = await this.provider.getNetwork();
            const blockNumber = await this.provider.getBlockNumber();
            const gasPrice = await this.provider.getGasPrice();
            const block = await this.provider.getBlock('latest');
            const feeData = await this.provider.getFeeData();

            const networkInfo = {
                chain: {
                    name: this.chainName,
                    id: this.chainId,
                    hexId: this.hexChainId
                },
                block: {
                    number: block.number,
                    hash: block.hash,
                    timestamp: new Date(block.timestamp * 1000).toISOString(),
                    gasUsed: block.gasUsed.toString(),
                    gasLimit: block.gasLimit.toString(),
                    transactions: block.transactions.length
                },
                gas: {
                    gasPrice: ethers.utils.formatUnits(gasPrice, 'gwei'),
                    baseFeePerGas: feeData.lastBaseFeePerGas ? ethers.utils.formatUnits(feeData.lastBaseFeePerGas, 'gwei') : 'N/A',
                    maxFeePerGas: feeData.maxFeePerGas ? ethers.utils.formatUnits(feeData.maxFeePerGas, 'gwei') : 'N/A'
                },
                timestamp: new Date().toISOString()
            };

            fs.writeFileSync(this.networkInfoFile, JSON.stringify(networkInfo, null, 2));
            return networkInfo;

        } catch (error) {
            console.error('❌ Error fetching network info:', error.message);
            return null;
        }
    }

    /**
     * Get Address Data from Chain 999
     */
    async getAddressDataChain999() {
        try {
            console.log(`\n📊 Fetching Chain 999 address data for: ${this.infuraAddress}`);
            
            const balance = await this.provider.getBalance(this.infuraAddress);
            const transactionCount = await this.provider.getTransactionCount(this.infuraAddress);
            const code = await this.provider.getCode(this.infuraAddress);

            const addressData = {
                address: this.infuraAddress,
                network: this.chainName,
                chainId: this.chainId,
                hexChainId: this.hexChainId,
                balance: ethers.utils.formatEther(balance),
                balanceWei: balance.toString(),
                transactionCount: transactionCount,
                isContract: code !== '0x',
                codeLength: code.length,
                fetchedAt: new Date().toISOString()
            };

            console.log(`✅ Chain 999 Address Data:`);
            console.log(`   Balance: ${addressData.balance} ETH`);
            console.log(`   Transaction Count: ${addressData.transactionCount}`);
            console.log(`   Is Contract: ${addressData.isContract}`);

            return addressData;

        } catch (error) {
            console.error('❌ Error fetching Chain 999 address data:', error.message);
            return null;
        }
    }

    /**
     * Get Address Data from Ethereum
     */
    async getAddressDataEthereum() {
        try {
            if (!this.ethProvider) {
                console.log('⚠️  Ethereum RPC not configured, skipping');
                return null;
            }

            console.log(`\n📊 Fetching Ethereum address data for: ${this.infuraAddress}`);
            
            const balance = await this.ethProvider.getBalance(this.infuraAddress);
            const transactionCount = await this.ethProvider.getTransactionCount(this.infuraAddress);
            const code = await this.ethProvider.getCode(this.infuraAddress);

            const addressData = {
                address: this.infuraAddress,
                network: 'Ethereum Mainnet',
                chainId: 1,
                balance: ethers.utils.formatEther(balance),
                balanceWei: balance.toString(),
                transactionCount: transactionCount,
                isContract: code !== '0x',
                codeLength: code.length,
                fetchedAt: new Date().toISOString()
            };

            console.log(`✅ Ethereum Address Data:`);
            console.log(`   Balance: ${addressData.balance} ETH`);
            console.log(`   Transaction Count: ${addressData.transactionCount}`);

            return addressData;

        } catch (error) {
            console.error('❌ Error fetching Ethereum address data:', error.message);
            return null;
        }
    }

    /**
     * Perform Periodic Address Update
     */
    async performAddressUpdate() {
        try {
            const chain999Data = await this.getAddressDataChain999();
            const ethereumData = await this.getAddressDataEthereum();

            const combinedData = {
                timestamp: new Date().toISOString(),
                infuraAddress: this.infuraAddress,
                networks: {
                    chain999: chain999Data,
                    ethereum: ethereumData
                },
                summary: {
                    chain999Balance: chain999Data ? chain999Data.balance : 'N/A',
                    ethereumBalance: ethereumData ? ethereumData.balance : 'N/A',
                    chain999Tx: chain999Data ? chain999Data.transactionCount : 0,
                    ethereumTx: ethereumData ? ethereumData.transactionCount : 0
                }
            };

            // Save current data
            fs.writeFileSync(this.addressDataFile, JSON.stringify(combinedData, null, 2));
            console.log(`\n✅ Address data saved`);

            // Save to history
            this.saveToHistory(combinedData);

            // Display summary
            this.displayAddressUpdateSummary(combinedData);

        } catch (error) {
            console.error('❌ Error in periodic update:', error.message);
        }
    }

    /**
     * Save to History
     */
    saveToHistory(data) {
        try {
            let history = [];
            
            if (fs.existsSync(this.addressHistoryFile)) {
                history = JSON.parse(fs.readFileSync(this.addressHistoryFile, 'utf8'));
            }

            history.push(data);

            if (history.length > 100) {
                history = history.slice(-100);
            }

            fs.writeFileSync(this.addressHistoryFile, JSON.stringify(history, null, 2));
            console.log(`📝 History saved (Total entries: ${history.length})`);

        } catch (error) {
            console.error('❌ Error saving to history:', error.message);
        }
    }

    /**
     * Display Address Update Summary
     */
    displayAddressUpdateSummary(data) {
        console.log('\n📋 ============ ADDRESS UPDATE SUMMARY ============');
        console.log(`Address: ${data.infuraAddress}`);
        console.log(`Update Time: ${data.timestamp}`);
        console.log('\n🔗 HyperEVM Chain 999:');
        if (data.networks.chain999) {
            console.log(`   Chain ID: ${data.networks.chain999.chainId}`);
            console.log(`   Balance: ${data.networks.chain999.balance} ETH`);
            console.log(`   Transactions: ${data.networks.chain999.transactionCount}`);
        }
        console.log('\n🔗 Ethereum Mainnet:');
        if (data.networks.ethereum) {
            console.log(`   Balance: ${data.networks.ethereum.balance} ETH`);
            console.log(`   Transactions: ${data.networks.ethereum.transactionCount}`);
        }
        console.log('================================================\n');
    }

    /**
     * Start Periodic Updates
     */
    async startPeriodicUpdates() {
        console.log(`\n⏱️  Starting periodic address data updates (Every 15 minutes)`);

        // Initial update
        await this.performAddressUpdate();

        // Subsequent updates
        setInterval(async () => {
            console.log(`\n${'='.repeat(60)}`);
            console.log(`⏰ Scheduled Update: ${new Date().toISOString()}`);
            console.log(`${'='.repeat(60)}`);
            await this.performAddressUpdate();
        }, this.updateInterval);
    }

    /**
     * Sync Latest Block
     */
    async syncLatestBlock() {
        try {
            const blockNumber = await this.provider.getBlockNumber();
            const block = await this.provider.getBlock(blockNumber);

            if (!block) {
                return null;
            }

            const blockData = {
                blockNumber: block.number,
                hash: block.hash,
                parentHash: block.parentHash,
                timestamp: block.timestamp,
                miner: block.miner,
                gasUsed: block.gasUsed.toString(),
                gasLimit: block.gasLimit.toString(),
                transactions: block.transactions.length,
                difficulty: block.difficulty ? block.difficulty.toString() : '0',
                syncedAt: new Date().toISOString(),
                chainId: this.chainId,
                chainName: this.chainName,
                rpcEndpoint: this.rpcEndpoint
            };

            return blockData;

        } catch (error) {
            console.error('❌ Error syncing latest block:', error.message);
            return null;
        }
    }

    /**
     * Start Block Monitoring
     */
    async startMonitoring() {
        console.log(`\n⏱️  Starting block monitoring (Interval: ${this.syncInterval}ms)\n`);

        setInterval(async () => {
            try {
                const blockData = await this.syncLatestBlock();

                if (blockData) {
                    const isDuplicate = this.syncedBlocks.some(b => b.blockNumber === blockData.blockNumber);

                    if (!isDuplicate) {
                        this.syncedBlocks.push(blockData);
                        this.lastSyncedBlock = blockData.blockNumber;

                        console.log(`\n✅ New Block Synced!`);
                        console.log(`   Block #${blockData.blockNumber}`);
                        console.log(`   Chain: ${blockData.chainName} (ID: ${blockData.chainId})`);
                        console.log(`   Hash: ${blockData.hash}`);
                        console.log(`   Transactions: ${blockData.transactions}`);
                        console.log(`   Gas Used: ${blockData.gasUsed} / ${blockData.gasLimit}`);

                        if (this.syncedBlocks.length % 10 === 0) {
                            this.saveData();
                        }
                    }
                }

            } catch (error) {
                console.error(`❌ Monitoring Error: ${error.message}`);
            }
        }, this.syncInterval);
    }

    /**
     * Save Synced Data
     */
    saveData() {
        try {
            fs.writeFileSync(this.dataFile, JSON.stringify(this.syncedBlocks, null, 2));
            console.log(`💾 Data saved to ${this.dataFile}`);
        } catch (error) {
            console.error('❌ Error saving data:', error.message);
        }
    }

    /**
     * Get Statistics
     */
    getStats() {
        const stats = {
            chain: {
                name: this.chainName,
                id: this.chainId,
                hexId: this.hexChainId
            },
            sync: {
                totalBlocksSynced: this.syncedBlocks.length,
                lastBlockNumber: this.lastSyncedBlock,
                totalTransactions: this.syncedBlocks.reduce((sum, b) => sum + b.transactions, 0),
                averageGasUsed: this.syncedBlocks.length > 0
                    ? (this.syncedBlocks.reduce((sum, b) => sum + parseInt(b.gasUsed), 0) / this.syncedBlocks.length).toFixed(2)
                    : 0
            },
            rpc: {
                endpoint: this.rpcEndpoint
            },
            syncedAt: new Date().toISOString()
        };

        fs.writeFileSync(this.statsFile, JSON.stringify(stats, null, 2));
        return stats;
    }

    /**
     * Display Statistics
     */
    displayStats() {
        const stats = this.getStats();
        console.log('\n📊 ============ SYNC STATISTICS ============');
        console.log(`Chain: ${stats.chain.name} (ID: ${stats.chain.id})`);
        console.log(`Total Blocks Synced: ${stats.sync.totalBlocksSynced}`);
        console.log(`Last Block Number: ${stats.sync.lastBlockNumber}`);
        console.log(`Total Transactions: ${stats.sync.totalTransactions}`);
        console.log(`Average Gas Used: ${stats.sync.averageGasUsed}`);
        console.log(`RPC Endpoint: ${stats.rpc.endpoint}`);
        console.log(`Synced At: ${stats.syncedAt}`);
        console.log('=========================================\n');
    }
}

/**
 * Main Execution
 */
async function main() {
    try {
        const syncManager = new HyperEVMChain999SyncManager();
        await syncManager.initialize();
        
        // Get network info
        await syncManager.getNetworkInfo();
        
        // Start block monitoring
        await syncManager.startMonitoring();

        // Start periodic updates
        await syncManager.startPeriodicUpdates();

        // Display stats every 60 seconds
        setInterval(() => {
            syncManager.displayStats();
        }, 60000);

    } catch (error) {
        console.error('❌ Fatal Error:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n👋 Shutting down gracefully...');
    process.exit(0);
});

// Start the application
main();