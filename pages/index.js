import { useState } from 'react';
import styles from '../styles/Home.module.css';
import axios from 'axios';

export default function Home({ data }) {
  const [category, setCategory] = useState();
  const [amount, setAmount] = useState();
  const [dataPlans, setDataPlans] = useState([]);
  const [network, setNetwork] = useState();
  const [phoneNumber, setPhoneNumber] = useState();

  async function fetchDataPlans(e) {
    e.preventDefault();

    axios
      .request({
        method: 'POST',
        url: 'https://billing-staging.bytestacks.io/api/v1/bundles',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          'api-key': process.env.API_KEY,
        },
        data: { telco: e.target.value },
      })
      .then(function (response) {
        setNetwork(e.target.value);
        setDataPlans(response.data.data);
      })
      .catch(function (error) {
        console.error(error);
      });
  }

  async function purchaseAirtime(e) {
    e.preventDefault();

    axios
      .request({
        method: 'POST',
        url: 'https://billing-staging.bytestacks.io/api/v1/vend_airtime',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          'api-key': process.env.API_KEY,
        },
        data: { amount, phone_no: phoneNumber, telco: network },
      })
      .then(function (response) {
        alert(response.data.data.message);
      })
      .catch(function (error) {
        console.error(error);
      });
  }

  async function purchaseData(e) {
    e.preventDefault();

    axios
      .request({
        method: 'POST',
        url: 'https://billing-staging.bytestacks.io/api/v1/vend_data',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          'api-key': process.env.API_KEY,
        },
        data: {
          amount,
          phone_no: phoneNumber,
          telco: network,
          data_code: amount,
        },
      })
      .then(function (response) {
        alert(response.data.data.message);
      })
      .catch(function (error) {
        console.error(error);
      });
  }

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div>
          <label htmlFor='cars'>Select a category:</label>
          <select
            className={styles.customSelect}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value='vend_airtime'>Airtime</option>
            <option value='vend_data'>Data</option>
          </select>

          <label htmlFor=''>Choose a network:</label>
          <select
            className={styles.customSelect}
            onChange={
              category == 'vend_data'
                ? (e) => fetchDataPlans(e)
                : (e) => setNetwork(e.target.value)
            }
          >
            {data.map((network, i) => (
              <option value={network.shortname} key={i}>
                {network.name}
              </option>
            ))}
          </select>

          {category == 'vend_data' ? (
            <>
              <label htmlFor=''>Available Bundles:</label>
              <select
                className={styles.customSelect}
                onChange={(e) => setAmount(e.target.value)}
              >
                {dataPlans.map((plan, i) => (
                  <option value={plan.price} key={i}>
                    {plan.name} - {plan.price}
                  </option>
                ))}
              </select>
            </>
          ) : (
            ''
          )}

          <label htmlFor=''>
            <b>Amount:</b>
          </label>
          <input
            type='text'
            value={amount != undefined ? amount : ''}
            readOnly={category == 'vend_data' ? true : false}
            onChange={(e) => setAmount(e.target.value)}
          />

          <label htmlFor=''>
            <b>Mobile number:</b>
          </label>
          <input type='text' onChange={(e) => setPhoneNumber(e.target.value)} />

          <button
            onClick={
              category == 'vend_data'
                ? (e) => purchaseData(e)
                : (e) => purchaseAirtime(e)
            }
          >
            Continue
          </button>
        </div>
      </main>
    </div>
  );
}

export async function getServerSideProps() {
  const data = await fetch(
    'https://billing-staging.bytestacks.io/api/v1/telcos',
    {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'api-key': process.env.API_KEY,
      },
    }
  )
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      return data.data;
    });

  return { props: { data } };
}
