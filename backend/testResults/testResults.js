const axios = require("axios");

axios.get("http://localhost:5000/api/resume/results")
  .then(response => {
    console.log("Response:", response.data);
  })
  .catch(error => {
    console.error("Error:", error.response ? error.response.data : error.message);
  });