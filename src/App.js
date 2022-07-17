import Popup from 'reactjs-popup';
//update the utils file everytime you change the contract

import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import './App.css';
import abi from "./utils/BookWall.json"
//This is what you pasted that you found in the contract code
import sample from "./component/video/video.mp4";

const App = () => {
  /*
  * Just a state variable we use to store our user's public wallet.
  */
  const [currentAccount, setCurrentAccount] = useState("");

  //Trying to let the user send individual messages
  const [oldMessage, setMessage] = useState("This is a message");

   /*
   * All state property to store all waves
   */
   const [allBooks, setAllBooks] = useState([]);

  //Variable for the contact address
  const contractAddress = "0xe4f6168F8C25790c0a2988f25af59d509AD629FA";

  /*
   * Create a method that gets all waves from your contract
   */
  const getAllBooks = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const bookPortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        /*
         * Call the getAllWaves method from your Smart Contract
         */
       const books = await bookPortalContract.getAllBooks();


        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        let booksCleaned = [];
        books.forEach(book => {
          booksCleaned.push({
            address: book.recommender,
            timestamp: new Date(book.timestamp * 1000),
            message: book.message
          });
        });

        /*
         * Store our data in React State
         */
        setAllBooks(booksCleaned);
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    let bookPortalContract;
  
    const onNewBook = (from, timestamp, message) => {
      console.log("NewBook", from, timestamp, message);
      setAllBooks(prevState => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ]);
    };
  
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
  
      bookPortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      bookPortalContract.on("NewBook", onNewBook);
    }
  
    return () => {
      if (bookPortalContract) {
        bookPortalContract.off("NewBook", onNewBook);
      }
    };
  }, []);

  //referbces abi content
  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      /*
      * Check if we're authorized to access the user's wallet, picks up the first account if there are multiple in the wallet
      */
      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account)
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
  * Implement your connectWallet method here
  */
   const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }


  //functions that gets the value of whatever your recomendation is
  const handleChange = event => {
    setMessage(event.target.value);
    

  }


  

  const book = async () => {
    try {
      const {ethereum} = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner(); //abstraction of an ETH account that can be used to sign messages and transactions
        //We use ethers to help our frontend talk to the contract

        const bookPortalContract = new ethers.Contract(contractAddress, contractABI, signer);
        //this helps you read data from your contract

        let count = await bookPortalContract.getTotalBooks();
        console.log("Retrieved total wave count...", count.toNumber());

        
        


        /*
        * Execute the actual wave from your smart contract
        */
        const bookTxn = await bookPortalContract.book(oldMessage, { gasLimit: 300000});
        console.log("Mining...", bookTxn.hash);

        await bookTxn.wait();
        console.log("Mined -- ", bookTxn.hash);

        count = await bookPortalContract.getTotalBooks();
        console.log("Retrieved total wave count...", count.toNumber());
        

      } else {
        console.log("Ethereum object doesn't exist");
      }
    } catch (error) {
      console.log(error);
    }
  }




  useEffect(() => {
    checkIfWalletIsConnected();
    getAllBooks();
  }, [])

  //getAllBooks();
  
  return (
    <div className="mainContainer">


      <div className="dataContainer">
      <video autoPlay loop muted
       style={{
          position: "absolute",
          width: "100%",
          left: "50%",
          top: "50%",
          height: "100%",
          objectFit: "cover",
          transform: "translate(-50%, -50%)",
          zIndex:"-1"
       }}
       >
        <source src={sample} type="video/mp4"/>
      </video>
        <div className="header">
        Welcome to BookWall
        </div>

        <div className="bio">
        Shoot me a book recommendation and if I like it I will send you some ETH $$$

        </div>
        <div>
          
        <Popup trigger={<input
            type="text"
            id="message"
            name="message"
            defaultValue={"Type your recommendation :))"}
            onChange={handleChange}
            />} position="left center">
          <div className="popup">You can only recommend 1 book every 15 minutes</div>
        </Popup>
        </div>


        <button className="waveButton" onClick={book}>
          Send It
        </button>

        {/*
        * If there is no currentAccount render this button
        */}
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        {allBooks.map((book, index) => {
          return (
            <div key={index} style={{ backgroundColor: "azure", marginTop: "16px", padding: "8px" }}>
              <div>Address: {book.address}</div>
              <div>Time: {book.timestamp.toString()}</div>
              <div>Message: {book.message}</div>
            </div>)
        })}

      </div>
    </div>
    
  );
}

export default App


//Inside utils we copy and paste the contect of the json file inside the contracts folder of our contract so that it can talk with our frontend