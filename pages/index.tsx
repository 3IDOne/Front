import React from 'react';
import Image from 'next/image';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi';
import { abi } from '../contract-abi';
import FlipCard, { BackCard, FrontCard } from '../components/FlipCard';
import { useChainId } from 'wagmi'
import { WorkerRequest } from '../types'
import { useDebounce } from '../hooks/useDebounce'
import { useFetch } from '../hooks/useFetch'
import { useAccountEffect } from 'wagmi'
import { useConnect } from 'wagmi'
import { type UseAccountParameters } from 'wagmi'
import { type UseAccountReturnType } from 'wagmi'
import { useSignMessage } from 'wagmi'
import { Helper, Link } from '../styles'







const contractConfig = {
  address: '0x39039e8994e1e58fc4a56c59ef1b497eebba7811',
  abi,
} as const;

const contractConfig2 = {
  address: '0x470a7B6581bBFC46ac5Bc28752ADAe4D6cf2fF3b',
  abi,
} as const;

const Home: NextPage = () => {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const [totalMinted, setTotalMinted] = React.useState(0n);
  const { isConnected } = useAccount();
  const { address } = useAccount();

  const { data, variables, signMessage } = useSignMessage()



  const [userAddress, setUserAddress] = React.useState('');
  const [domainName, setDomainName] = React.useState('');
  const [description, setDescription] = React.useState<string | undefined>(undefined)


  const {
    data: hash,
    writeContract: mint,
    isPending: isMintLoading,
    isSuccess: isMintStarted,
    error: mintError,
  } = useWriteContract();

  const {
    data: hash2,
    writeContract: mint2,
    isPending: isMintLoading2,
    isSuccess: isMintStarted2,
    error: mintError2,
  } = useWriteContract();

  const { data: totalSupplyData } = useReadContract({
    ...contractConfig,
    functionName: 'totalSupply',
  });

  const {
    data: txData,
    isSuccess: txSuccess,
    error: txError,
  } = useWaitForTransactionReceipt({
    hash,
    query: {
      enabled: !!hash,
    },
  });


  React.useEffect(() => {
    if (totalSupplyData) {
      setTotalMinted(totalSupplyData);
    }
  }, [totalSupplyData]);

  const isMinted = txSuccess;

  const config = useChainId()

  const regex = new RegExp('^[a-z0-9-]+$')
  const debouncedName = useDebounce(domainName, 500)
  const enabled = !!debouncedName && regex.test(debouncedName)

  const requestBody: WorkerRequest = {
    name: `${debouncedName}.3id.one`,
    owner: address!,
    addresses: { '60': address },
    texts: { description },
    signature: {
      hash: data!,
      message: 'Register',
    },
  }

  const {
    data: gatewayData,
    error: gatewayError,
    isLoading: gatewayIsLoading,
  } = useFetch(data && 'https://ens-gateway.popns.workers.dev/set', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  })


  return (
    <div className="page">
      <div className="container">
        <div style={{ flex: '1 1 auto' }}>
          <div style={{ padding: '24px 24px 24px 0' }}>
            <h1>Web
            <span style={{ color: 'blue' }}>3ID</span>
              entity for Every
            <span style={{ color: 'blue' }}>One</span>
            </h1>
            <p style={{ margin: '12px 0 24px' }}>
              {Number(totalMinted)} minted so far!
              Current Chain ID: {Number(config)}
            </p>
            <ConnectButton />

            <div style={{ display: 'flex', flexDirection: 'column', marginTop: 16 }}>
  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
    <label htmlFor="userAddress" style={{ marginRight: 8, fontWeight: 'bold' }}>
      Address:
    </label>
    <input
      type="text"
      id="userAddress"
      value={userAddress}
      onChange={(e) => setUserAddress(e.target.value)}
      style={{
        padding: '8px 12px',
        border: '1px solid #ccc',
        borderRadius: 4,
        outline: 'none',
        fontSize: '16px',
        flex: 1,
      }}
    />
  </div>
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <label htmlFor="domainName" style={{ marginRight: 8, fontWeight: 'bold' }}>
      Domain Name:
    </label>
    <input
      type="text"
      id="domainName"
      value={domainName}
      onChange={(e) => setDomainName(e.target.value)}
      style={{
        padding: '8px 12px',
        border: '1px solid #ccc',
        borderRadius: 4,
        outline: 'none',
        fontSize: '16px',
        flex: 1,
      }}
    />
  </div>

  <div style={{ display: 'flex', alignItems: 'center' }}>
    <label htmlFor="Description" style={{ marginRight: 8, fontWeight: 'bold' }}>
    Description:
    </label>
    <input
      type="text"
      id="Description"
      value={description}
      onChange={(e) => setDescription(e.target.value)}
      style={{
        padding: '8px 12px',
        border: '1px solid #ccc',
        borderRadius: 4,
        outline: 'none',
        fontSize: '16px',
        flex: 1,
      }}
    />
  </div>
</div>

            {mintError && (
              <p style={{ marginTop: 24, color: '#FF6257' }}>
                Error: {mintError.message}
              </p>
            )}
            {txError && (
              <p style={{ marginTop: 24, color: '#FF6257' }}>
                Error: {txError.message}
              </p>
            )}

            {mounted && isConnected && !isMinted && (
              <button
                style={{ marginTop: 24 }}
                disabled={!mint || isMintLoading || isMintStarted}
                className="button"
                data-mint-loading={isMintLoading}
                data-mint-started={isMintStarted}
                onClick={() => {
                  if (config===11155111)
                    {
                      mint?.({
                        ...contractConfig,
                        functionName: 'mintSubdomain',
                        args: [`0x${userAddress.substring(2)}`, domainName],
                      })
                    }

                    if (config===11155420)
                      {
                          signMessage({message: `Register`,})
                        //  signMessage({message: `Register ${debouncedName}.offchaindemo.eth`,})
                      }            
                }
                                   
                }
              >
                {isMintLoading && 'Waiting for approval'}
                {isMintStarted && 'Minting...'}
                {!isMintLoading && !isMintStarted && 'Mint'}
              </button>
            )}
          </div>
        </div>

        {gatewayError ? (
  <div style={{ color: 'red' }}>
    {gatewayError.message === 'Conflict'
      ? 'Somebody already registered that name'
      : 'Something went wrong'}
  </div>
) : gatewayData ? (
  <div>
    <p>
      Visit the{' '}
      <a
        href={`https://ens.app/${debouncedName}.offchaindemo.eth`}
        target="_blank"
        rel="noopener noreferrer"
      >
        ENS Manager
      </a>{' '}
      to see your name
    </p>
  </div>
) : !!debouncedName && !enabled ? (
  <div style={{ color: 'red' }}>Name must be lowercase alphanumeric</div>
) : null}


        {/* Existing FlipCard component */}
        <div style={{ flex: '0 0 auto' }}>
          <FlipCard>
            <FrontCard isCardFlipped={isMinted}>
              <Image
                layout="responsive"
                src="/nft.png"
                width="500"
                height="500"
                alt="RainbowKit Demo NFT"
              />
              <h1 style={{ marginTop: 24 }}>Rainbow NFT</h1>
              <ConnectButton />
            </FrontCard>
            <BackCard isCardFlipped={isMinted}>
              <div style={{ padding: 24 }}>
                <Image
                  src="/nft.png"
                  width="80"
                  height="80"
                  alt="RainbowKit Demo NFT"
                  style={{ borderRadius: 8 }}
                />
                <h2 style={{ marginTop: 24, marginBottom: 6 }}>NFT Minted!</h2>
                <p style={{ marginBottom: 24 }}>
                  Your NFT will show up in your wallet in the next few minutes.
                </p>
                <p style={{ marginBottom: 6 }}>
                  View on{' '}
                  <a href={`https://rinkeby.etherscan.io/tx/${hash}`}>
                    Etherscan
                  </a>
                </p>
                <p>
                  View on{' '}
                  <a
                    href={`https://testnets.opensea.io/assets/rinkeby/${txData?.to}/1`}
                  >
                    Opensea
                  </a>
                </p>
              </div>
            </BackCard>
          </FlipCard>
        </div>
      </div>
    </div>
  );
};

export default Home;