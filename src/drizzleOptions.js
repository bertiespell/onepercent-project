import ComplexStorage from './ABI/build/contracts/ComplexStorage.json'
import SimpleStorage from './ABI/build/contracts/SimpleStorage.json'
import TutorialToken from './ABI/build/contracts/TutorialToken.json'

const drizzleOptions = {
  web3: {
    block: false,
    fallback: {
      type: 'ws',
      url: 'ws://127.0.0.1:7545'
    }
  },
  contracts: [
    ComplexStorage,
    SimpleStorage,
    TutorialToken
  ],
  events: {
    SimpleStorage: ['StorageSet']
  },
  polls: {
    accounts: 1500
  }
}

export default drizzleOptions
