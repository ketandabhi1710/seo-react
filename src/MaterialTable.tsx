import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const MaterialTable = ({ data, columns, onDelete }: any) => {
  const tableColumns = columns || (data.length > 0 ? Object.keys(data[0]) : []);

  const containerStyle = {
    marginTop: "20px",
  };

  const tableStyle = {
    width: "80%",
    margin: "auto",
    marginTop: "10px",
  };

  const headingStyle = {
    fontSize: "1.2rem",
    fontWeight: "bold",
  };

  const deleteButtonStyle = {
    color: "#e53935",
  };

  return (
    <TableContainer component={Paper} style={containerStyle}>
      <Table aria-label="simple table" style={tableStyle}>
        <TableHead>
          <TableRow>
            {tableColumns.map((column: any) => (
              <TableCell key={column} style={headingStyle}>
                {column}
              </TableCell>
            ))}
            <TableCell style={headingStyle}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row: any, index: any) => (
            <TableRow key={index}>
              {tableColumns.map((column: any) => (
                <TableCell key={column}>
                  {typeof row[column] === "object"
                    ? JSON.stringify(row[column])
                    : row[column]}
                </TableCell>
              ))}
              <TableCell>
                <IconButton
                  aria-label="delete"
                  onClick={() => onDelete && onDelete(row)}
                  style={deleteButtonStyle}
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default MaterialTable;
