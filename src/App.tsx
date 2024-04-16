import React, { useEffect, useRef, useState } from "react";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import axios from "axios";
import Papa from "papaparse";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { parse } from "csv-parse";
import "./App.css";
import {
  Alert,
  Box,
  Checkbox,
  Fade,
  FormControl,
  Modal,
  Snackbar,
  TextField,
} from "@mui/material";
import MaterialTable from "./MaterialTable";
import { io } from "socket.io-client";
function App() {
  const [timeIntervalModal, setTimeIntervalModal] = useState(false);
  const [credentialModal, setcredentialModal] = useState(false);
  const [columnNamesArray, setColumnNamesArray] = useState<any>([]);
  const [headerCheck, setHeaderCheck] = useState<any>(true);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [data, setData] = useState<any>([]);
  const [open, setOpen] = useState(false);
  const [publishedPostsArray, setpublishedPostsArray] = useState<any>([]);
  const [alertmessage, setAlertMessage] = useState<any>("Success");
  const [showMaterialTable, setShowMaterialTable] = useState(false);

  const validHeaders = [
    "date",
    "date_gmt",
    "guid",
    "id",
    "link",
    "modified",
    "modified_gmt",
    "slug",
    "status",
    "type",
    "password",
    "permalink_template",
    "generated_slug",
    "title",
    "content",
    "author",
    "excerpt",
    "featured_media",
    "comment_status",
    "ping_status",
    "format",
    "meta",
    "sticky",
    "template",
    "categories",
    "tags",
  ];

  const handleShowMaterialTable = () => {
    setShowMaterialTable(true);
  };

  const handleCloseMaterialTable = () => {
    setShowMaterialTable(false);
  };
  const style = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
  };

  const [formData, setFormData] = useState<any>({
    username: "",
    password: "",
    url: "",
  });

  const [timeIntervalForm, setTimeIntervalForm] = useState<any>({
    timeinterval: 10,
  });

  const muiColumns: GridColDef[] = [
    {
      field: "selection",
      headerName: "Select",
      width: 70,
      sortable: false,
      filterable: false,
      renderHeader: () => (
        <Checkbox
          checked={headerCheck}
          onChange={(event) => {
            setHeaderCheck(!headerCheck);
            setData(
              data.map((e: any) => {
                return { ...e, isChecked: !headerCheck };
              })
            );
          }}
        />
      ),
      renderCell: (params: any) => (
        <Checkbox
          checked={params.row.isChecked}
          onChange={() => {
            handleCheckboxChange(params.row);
          }}
        />
      ),
    },
    ...columnNamesArray.map((columnName: any) => ({
      field: columnName,
      headerName: columnName,
      ellipsis: true,
      width: 200,
      headerClassName: "tableHeader",
      headerAlign: "left",
      renderCell: (params: any) => <CustomCellRenderer value={params.value} />,
    })),
  ];

  const deletePost = async (value: any) => {
    try {
      const username: any = localStorage.getItem("username");
      const password: any = localStorage.getItem("password");
      const url: any = localStorage.getItem("url");
      const response: any = await axios.delete(`${url}/wp-json/wp/v2/posts/${value.id}`, {
        auth: { username, password },
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.status === 200) {
        const newpublishedData = publishedPostsArray.filter(
          (item: any) => item.id !== value.id
        );
        setAlertMessage("Post Successfully Deleted.");
        setOpen(true);
        setpublishedPostsArray(newpublishedData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleInputChangeTimeInteval = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setTimeIntervalForm((prevData: any) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData: any) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleCredential = async () => {
    localStorage.removeItem("username");
    localStorage.removeItem("password");
    localStorage.removeItem("url");
    localStorage.setItem("username", formData.username);
    localStorage.setItem("password", formData.password);
    localStorage.setItem("url", formData.url);
    setAlertMessage("Credentials saved.");
    setOpen(true);
  };

  const handleTimeInteval = () => {
    localStorage.removeItem("timeinterval");
    localStorage.setItem("timeinterval", timeIntervalForm.timeinterval);
    setAlertMessage("Timer Interval set Successfully.");
    setOpen(true);
  };
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleCheckboxChange = (row: any) => {
    setData(
      data.map((o: any) => {
        if (o.Id === row.Id) return { ...o, isChecked: !o.isChecked };
        else return o;
      })
    );
    setSelectedRows([...selectedRows, row.Id]);
  };


  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file: any = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      const newData: any = [];
      reader.onload = async (e: any) => {
        const data = e.target.result;
        Papa.parse(data, {
          complete: function (results) {
            // console.log("results: ", results.data);
            // debugger;
            const tempdata = results.data;
            const header: any = results.data[0];
            const headers = header.map((header: any) =>
              header.replace(/["']/g, "").trim()
            );

            setColumnNamesArray(headers);
            const keys: any = results.data.shift();
            const formatted: any = results.data.reduce((agg: any, arr: any) => {
              agg.push(
                arr.reduce((obj: any, item: any, index: any) => {
                  obj[keys[index]] = item;
                  return obj;
                }, {})
              );
              return agg;
            }, []);
            const av = formatted.map((e: any, i: any) => {
              return { ...e, Id: i, isChecked: true };
            });
            // console.log(av, "---ac");
            setData(av);
          },
        });
        checkData();
      };

      reader.readAsText(file);
    }
  };

  useEffect(() => {
    const socket = io("ws://localhost:8000/", {
      // const socket = io("wss://dev-api.sattu.ai/", {
      transports: ["websocket"],
    });

    // Listen for the "postPublished" event from the server
    socket.on("postPublishedOncoStore", (data: any) => {
      console.log("publishedPostsArray :: oncostore :: ", publishedPostsArray);
      setpublishedPostsArray((prevPublishedPostsArray: any) => [
        ...prevPublishedPostsArray,
        data,
      ]);
      console.log("Received postPublished event:", data);
      // Do something in your UI to react to the published post
    });

    // Clean up the socket connection on component unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  const checkData = () => {
    for (const e of data) {
      if (!e.isChecked) {
        return setHeaderCheck(false);
      } else setHeaderCheck(true);
    }
  };
  const handleCellClick = (val: any) => {
  };

  const handleButtonClick = () => {
  };

  const validateWordPressCredentials = async (username: any, password: any) => {
    try {
      const response = await axios.post(
        "https://bookmyimports.com/wp-json/jwt-auth/v1/token",
        { username, password }
      );

      // If the request is successful, the credentials are valid
      return true;
    } catch (error) {
      // If there's an error, the credentials are invalid
      console.error("Invalid credentials", error);
      return false;
    }
  };
  const sendApiRequest = (index?: any) => {
    const dataArray: any = data.filter((item: any) => {
      return item.isChecked === true;
    });

    const username: any = localStorage.getItem("username");
    const password: any = localStorage.getItem("password");
    let baseurl: any = localStorage.getItem("url");
    const timeInterval: any = Number(localStorage.getItem("timeinterval"));
    let url: any;
    console.log("dataArray :: ", dataArray);
    axios
      .post(
        "http://localhost:8000/dynamic-post-publish-oncostore",
        // "https://dev-api.sattu.ai/dynamic-post-publish-oncostore",
        {
          baseurl,
          username,
          password,
          timeInterval,
          dataArray,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        // const res: any = JSON.parse(response);
        console.log("response", response);

      });
  };

  const CustomCellRenderer = ({ value }: { value: any }) => {
    return (
      <div
        style={{
          overflowY: "auto",
          maxHeight: "100%",
          whiteSpace: "pre-wrap",
          wordWrap: "break-word",
        }}
      >
        {value}
      </div>
    );
  };

  return (
    <>
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity="success"
          variant="filled"
          style={{
            width: "100%",
            justifyContent: "center",
          }}
        >
          {alertmessage}
        </Alert>
      </Snackbar>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          margin: "1% 4%",
        }}
      >
        <Typography variant="h4" gutterBottom style={{}}>
          sattu.ai
        </Typography>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            margin: "1% 4%",
            flexWrap: "wrap",
          }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={() => setcredentialModal(true)}
            style={{
              marginRight: "10px",
              backgroundColor: "#4CAF50",
              color: "white",
            }}
          >
            Set Credential
          </Button>
          <Button
            onClick={() => setTimeIntervalModal(true)}
            variant="contained"
            color="primary"
            style={{
              marginRight: "10px",
              backgroundColor: "#2196F3",
              color: "white",
            }}
          >
            Add Time Interval
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleExportClick}
            style={{
              marginRight: "10px",
              backgroundColor: "#FF9800",
              color: "white",
            }}
          >
            Upload
          </Button>

          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </div>
      </div>

      <div
        style={{
          width: "90%",
          margin: "2% auto",
        }}
      >
        <DataGrid
          rows={data}
          getRowId={(row) => row.Id}
          onCellClick={handleCellClick}
          columns={muiColumns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          pageSizeOptions={[5, 10]}
        />
        <div style={{ marginTop: "20px" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              handleButtonClick();

              // validateWordPressCredentials(
              //   "rahul.vijayamgmt@gmail.com",
              //   "tBhR 6g4m xpIq GUJR 9Ce9 B7QF"
              // ).then((isValid: any) => {
              //   if (isValid) {
              //     // console.log(isValid, "----valid");
              //     // Continue with the post request using Axios
              //     // Make sure to include the authentication token if needed
              //     // axios.post(
              //     //   "https://your-wordpress-site.com/wp-json/wp/v2/posts",
              //     //   {
              //     //     // Your post data
              //     //   }
              //     // );
              //   } else {
              //     // Handle invalid credentials
              //     console.error("Invalid credentials. Unable to create post.");
              //   }
              // });
              sendApiRequest(0);
            }}
          >
            publish
          </Button>
        </div>
        <div>
          <Button
            variant="contained"
            color="primary"
            onClick={handleShowMaterialTable}
            style={{ marginTop: "10px" }}
          >
            Show Published Posts
          </Button>

          {showMaterialTable && (
            <div>
              <MaterialTable data={publishedPostsArray} onDelete={deletePost} />

              <Button onClick={handleCloseMaterialTable}>Hide Table</Button>
            </div>
          )}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: "1%",
          color: "darkgrey",
          right: "1%",
        }}
      >
        {/* <Typography variant="body1"> Powered by CloudsCube</Typography> */}
      </div>

      {/* add credential */}
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={credentialModal}
        onClose={() => setcredentialModal(false)}
        closeAfterTransition
      >
        <Fade in={credentialModal}>
          <Box
            sx={{ ...style, maxWidth: 400, minWidth: 300, textAlign: "center" }}
          >
            <Typography
              id="transition-modal-title"
              variant="h5"
              component="h2"
              style={{ marginBottom: "20px" }}
            >
              Set Credentials
            </Typography>

            <form onSubmit={handleCredential}>
              <FormControl fullWidth margin="normal">
                <TextField
                  label="Username"
                  placeholder="Username"
                  variant="outlined"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  fullWidth
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  style={{ marginBottom: "15px" }}
                />
                <TextField
                  label="Password"
                  variant="outlined"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  placeholder="Password"
                  fullWidth
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  type="password" // Masking the password
                  style={{ marginBottom: "20px" }}
                />
                <TextField
                  label="Url"
                  variant="outlined"
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                  name="url"
                  value={formData.url}
                  placeholder="https://example.com/wp-json/wp/v2/posts"
                  onChange={handleInputChange}
                  style={{ marginBottom: "20px" }}
                />
              </FormControl>
              <Button type="submit" variant="contained" color="primary">
                Submit
              </Button>
            </form>
          </Box>
        </Fade>
      </Modal>

      {/* Set Time Interval */}
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={timeIntervalModal}
        onClose={() => setTimeIntervalModal(false)}
        closeAfterTransition
      >
        <Fade in={timeIntervalModal}>
          <Box sx={style}>
            <Typography id="transition-modal-title" variant="h6" component="h2">
              Set Time Interval
            </Typography>

            <form onSubmit={handleTimeInteval}>
              <FormControl fullWidth margin="normal">
                <TextField
                  label="Time Interval (secs)"
                  variant="outlined"
                  fullWidth
                  name="timeinterval"
                  value={timeIntervalForm.timeinterval}
                  onChange={handleInputChangeTimeInteval}
                />
              </FormControl>
              <Button type="submit" variant="contained" color="primary">
                Submit
              </Button>
            </form>
          </Box>
        </Fade>
      </Modal>
    </>
  );
}

export default App;
