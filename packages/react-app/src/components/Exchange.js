import React, { useEffect, useState } from "react";
import { Contract } from "@ethersproject/contracts";
import { abis } from "@my-app/contracts";
import AmountIn from "./AmountIn";
import Balance from "./Balance";
import AmountOut from "./AmountOut";
import {
  getAvailableTokens,
  isOperationPending,
  getCounterpartTokens,
  findPoolByTokens,
} from "../utils";
import styles from "../styles";
import {
  useContractFunction,
  useEthers,
  useTokenAllowance,
  useTokenBalance,
} from "@usedapp/core";
import { parseUnits } from "ethers/lib/utils";
import { ROUTER_ADDRESS } from "../config";
import { ethers } from "ethers";
import {
  getApproveFailureMessage,
  getApproveSuccessMessage,
  getExecuteFailureMessage,
  getExecuteSuccessMessage,
} from "../utils/helpers";
const Exchange = ({ pools }) => {
  const { account } = useEthers();
  const [fromValue, setFromValue] = useState("0");
  const [fromToken, setFromToken] = useState(pools[0].token0address);
  const [toToken, setToToken] = useState("");
  const [resetState, setResetState] = useState(false);

  const fromValueBignumber = parseUnits(fromValue);
  const availableTokens = getAvailableTokens(pools);
  console.log(pools);
  const counterpartTokens = getCounterpartTokens(pools, fromToken);
  const pairAddress =
    findPoolByTokens(pools, fromToken, toToken)?.address ?? "";
  const routerContract = new Contract(ROUTER_ADDRESS, abis.router02);
  const fromTokenContract = new Contract(fromToken, abis.erc20.abi);
  const fromTokenBalance = useTokenBalance(fromToken, account);
  const toTokenBalance = useTokenBalance(toToken, account);
  const toknAllowance =
    useTokenAllowance(fromToken, account, ROUTER_ADDRESS) || parseUnits("0");
  const approvedNeeded = fromValueBignumber.gt(toknAllowance);
  const fromValueIsGreaterThan0 = fromValueBignumber.gt(parseUnits("0"));
  const hasEnoughBalance = fromValueBignumber.lte(
    fromTokenBalance ?? parseUnits("0")
  );

  const { state: swapApproveState, send: swapApproveSend } =
    useContractFunction(fromTokenContract, "approve", {
      transactionName: "onApproveRequested",
      gasLimitBufferPercentage: 10,
    });
  const { state: swapExecuteState, send: swapExecuteSend } =
    useContractFunction(routerContract, "swapExactTokensForTokens", {
      transactionName: "swapExactTokensForTokens",
      gasLimitBufferPercentage: 10,
    });

  const isApproving = isOperationPending(swapApproveState);
  const isSwapping = isOperationPending(swapExecuteState);
  const canApprove = !isApproving && approvedNeeded;
  const canSwap =
    !approvedNeeded &&
    !isSwapping &&
    fromValueIsGreaterThan0 &&
    hasEnoughBalance;
  const approveSuccessMessage = getApproveSuccessMessage(swapApproveState);
  const approveFailureMessage = getApproveFailureMessage(swapApproveState);
  const executeSuccessMessage = getExecuteSuccessMessage(swapExecuteState);
  const executeFailureMessage = getExecuteFailureMessage(swapExecuteState);

  const onApproveRequested = () => {
    swapApproveSend(ROUTER_ADDRESS, ethers.constants.MaxInt256);
  };
  const onSwapRequested = () => {
    swapExecuteSend(
      fromValueBignumber,
      0,
      [fromToken, toToken],
      account,
      Math.floor(Date.now() / 1000 + 60 * 20)
    ).then(() => {
      setFromValue("0");
    });
  };
  const onFromValueChange = (value) => {
    const trimmedValue = value.trim();
    try {
      trimmedValue && parseUnits(value);
      setFromValue(value);
    } catch (error) {
      console.log(error);
    }
  };
  const onFromTokenChange = (value) => {
    setFromToken(value);
  };
  const onToTokenChange = (value) => {
    setToToken(value);
  };

  useEffect(() => {
    if (
      executeFailureMessage ||
      executeSuccessMessage ||
      approveFailureMessage
    ) {
      setTimeout(() => {
        setResetState(true);
        setFromValue("0");
        setToToken("");
      }, 5000);
    }
  }, [executeFailureMessage, executeSuccessMessage, approveFailureMessage]);

  return (
    <div className="flex flex-col w-full items-center">
      <div className="mb-8">
        <AmountIn
          value={fromValue}
          onChange={onFromValueChange}
          currencyValue={fromToken}
          onSelect={onFromTokenChange}
          currencies={availableTokens}
          isSwapping={isSwapping && hasEnoughBalance}
        />
        <Balance tokenBalance={fromTokenBalance} />
      </div>
      <div className="mb-8 w-[100%]">
        <AmountOut
          fromToken={fromToken}
          toToken={toToken}
          amountIn={fromValueBignumber}
          pairContract={pairAddress}
          currencyValue={toToken}
          onSelect={onToTokenChange}
          currencies={counterpartTokens}
        />
        <Balance tokenBalance={toTokenBalance} />
      </div>
      {approvedNeeded && !isSwapping ? (
        <button
          disabled={!canApprove}
          onClick={onApproveRequested}
          className={`${
            canApprove
              ? "bg-site-pink text-white"
              : "bg-site-dim2 text-site-dim2"
          }${styles.actionButton}`}
        >
          {isApproving ? "Approving..." : "Approve"}
        </button>
      ) : (
        <button
          disabled={!canSwap}
          onClick={onSwapRequested}
          className={`${
            canSwap ? "bg-site-pink text-white" : "bg-site-dim2 text-site-dim2"
          }${styles.actionButton}`}
        >
          {isSwapping
            ? "Swapping..."
            : hasEnoughBalance
            ? "Swap"
            : "Insufficient Balance"}
        </button>
      )}
      {approveFailureMessage && !resetState ? (
        <p className={styles.message}>{approveFailureMessage}</p>
      ) : executeSuccessMessage ? (
        <p className={styles.message}>{executeSuccessMessage}</p>
      ) : executeFailureMessage ? (
        <p className={styles.message}>{executeFailureMessage}</p>
      ) : approveSuccessMessage ? (
        <p className={styles.message}>{approveSuccessMessage}</p>
      ) : (
        ""
      )}
    </div>
  );
};

export default Exchange;
