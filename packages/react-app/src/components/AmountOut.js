import React, { useEffect, useRef, useState } from "react";
import styles from "../styles";
import { chevronDown } from "../assets";
import { useAmountsOut, useOnClickOutside } from "../utils";
import { formatUnits } from "ethers/lib/utils";
const AmountOut = ({
  fromToken,
  toToken,
  amountIn,
  pairContract,
  currencyValue,
  onSelect,
  currencies,
}) => {
  const [showList, setShowList] = useState(false);
  const [activeCurrency, setActiveCurrency] = useState("Select");
  const ref = useRef();
  const amountOut =
    useAmountsOut(pairContract, amountIn, fromToken, toToken) ?? 0;
  useOnClickOutside(ref, () => setShowList(false));
  useEffect(() => {
    if (Object.keys(currencies).includes(currencyValue)) {
      setActiveCurrency(currencies[currencyValue]);
    } else {
      setActiveCurrency("Select");
    }
  }, [currencies, currencyValue]);
  return (
    <div className={styles.amountContainer}>
      <input
        placeholder="0.0"
        type="number"
        value={formatUnits(amountOut)}
        disabled={true}
        className={styles.amountInput}
      ></input>
      <div
        className="relative"
        onClick={() => {
          setShowList((prevState) => !prevState);
        }}
      >
        <button className={styles.currencyButton}>
          {activeCurrency}
          <img
            src={chevronDown}
            className={`w-4 h-4 object-contain ml-2 ${
              showList ? "rotate-180" : "rotate-0"
            }`}
            alt=""
          ></img>
        </button>
        {showList && (
          <ul ref={ref} className={styles.currencyList}>
            {Object.entries(currencies).map(([token, tokenName], index) => (
              <li
                key={index}
                className={styles.currencyListItem}
                onClick={() => {
                  if (typeof onSelect === "function") {
                    onSelect(token);
                    setActiveCurrency(tokenName);
                    setShowList(false);
                  }
                }}
              >
                {tokenName}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AmountOut;
