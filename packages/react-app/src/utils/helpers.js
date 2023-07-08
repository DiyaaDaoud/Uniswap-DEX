import { Contract } from "@ethersproject/contracts";
import { abis } from "@my-app/contracts";
import { useCall } from "@usedapp/core";
import { parseUnits } from "ethers/lib/utils";
import { useEffect } from "react";

import { ROUTER_ADDRESS } from "../config";

export const getAvailableTokens = (pools) =>
  pools.reduce((prev, curr) => {
    prev[curr.token0address] = curr.token0name;
    prev[curr.token1address] = curr.token1name;
    return prev;
  }, {});

export const getCounterpartTokens = (pools, fromToken) =>
  pools
    .filter((cur) => cur.token0address === fromToken || cur.token1address)
    .reduce((prev, curr) => {
      if (curr.token0address === fromToken) {
        prev[curr.token1address] = curr.token1name;
      } else if (curr.token1address === fromToken) {
        prev[curr.token0address] = curr.token0name;
      }
      return prev;
    }, {});

export const findPoolByTokens = (pools, fromToken, toToken) => {
  if (!Array.isArray(pools) || !fromToken || !toToken) return undefined;

  return pools.find(
    (cur) =>
      (cur.token0address === fromToken && cur.token1address === toToken) ||
      (cur.token1address === fromToken && cur.token0address === toToken)
  );
};

export const isOperationPending = (operationState) =>
  operationState.status === "PendingSignature" ||
  operationState.status === "Mining";
export const isOperationFailed = (operationState) =>
  operationState.status === "Fail" || operationState.status === "Exception";
export const isOperationSucceeded = (operationState) =>
  operationState.status === "Success";

export const getApproveFailureMessage = (swapApproveState) => {
  if (isOperationPending(swapApproveState)) {
    return undefined;
  }

  if (isOperationFailed(swapApproveState)) {
    return "Approval failed - " + swapApproveState.errorMessage;
  }

  return undefined;
};
export const getExecuteFailureMessage = (swapExecuteState) => {
  if (isOperationPending(swapExecuteState)) {
    return undefined;
  }
  if (isOperationFailed(swapExecuteState)) {
    return "Swap failed - " + swapExecuteState.errorMessage;
  }

  return undefined;
};

export const getApproveSuccessMessage = (swapApproveState) => {
  if (isOperationPending(swapApproveState)) {
    return undefined;
  }

  if (isOperationSucceeded(swapApproveState)) {
    return "Approval successful";
  }

  return undefined;
};

export const getExecuteSuccessMessage = (swapExecuteState) => {
  if (isOperationPending(swapExecuteState)) {
    return undefined;
  }

  if (isOperationSucceeded(swapExecuteState)) {
    return "Swap executed successfully";
  }

  return undefined;
};

export const useAmountsOut = (pairAddress, amountIn, fromToken, toToken) => {
  const isValidAmountIn = amountIn.gt(parseUnits("0"));
  const areParamsValid = !!(
    pairAddress &&
    isValidAmountIn &&
    fromToken &&
    toToken
  );

  const { error, value } =
    useCall(
      areParamsValid && {
        contract: new Contract(ROUTER_ADDRESS, abis.router02),
        method: "getAmountsOut",
        args: [amountIn, [fromToken, toToken]],
      }
    ) ?? {};
  return error ? parseUnits("0") : value?.amounts[1];
};

export const useOnClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = (event) => {
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
};
