import React, { useEffect, useState } from "react";
import SideMenu from "./SideMenu";
import axios from "axios";
import {
Table, TableHead, TableBody, TableRow, TableCell,
Paper, TableContainer, TextField, Switch, Dialog,
DialogContent, DialogActions, Button, IconButton, Box
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";

const BASE_URL = 'https://api.cashamsalone.com';

export default function EventsTable() {
const [events, setEvents] = useState([]);
const [search, setSearch] = useState("");
const [page, setPage] = useState(1);
const [previewImage, setPreviewImage] = useState(null);
const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null, eventId: null, message: "" });

const token = localStorage.getItem("adminToken");

const axiosInstance = axios.create({
headers: { Authorization: `Bearer ${token}` }
});

const fetchEvents = async () => {
if (!token) {
console.error("Admin token missing. Please log in.");
return;
}
try {
const res = await axiosInstance.get(`${BASE_URL}/admin/events`, { headers: { "Cache-Control": "no-cache" } });
const data = Array.isArray(res.data) ? res.data : res.data.events || [];
const sorted = data.sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate));
setEvents(sorted);
} catch (err) {
console.error("Error fetching events:", err);
}
};

const handleApprove = async (id) => {
try {
await axiosInstance.get(`${BASE_URL}/admin/events/approve/${id}`);
fetchEvents();
} catch (err) {
console.error("Approval error:", err);
}
};

const handleDelete = async (id) => {
try {
await axiosInstance.delete(`${BASE_URL}/admin/events/delete/${id}`);
fetchEvents();
} catch (err) {
console.error("Delete error:", err);
}
};

const openConfirmDialog = (action, id, message) => {
setConfirmDialog({ open: true, action, eventId: id, message });
};

const handleConfirm = () => {
if (confirmDialog.action === "approve") handleApprove(confirmDialog.eventId);
if (confirmDialog.action === "delete") handleDelete(confirmDialog.eventId);
setConfirmDialog({ open: false, action: null, eventId: null, message: "" });
};

const handleCancel = () => {
setConfirmDialog({ open: false, action: null, eventId: null, message: "" });
};

useEffect(() => {
fetchEvents();
}, []);

// Search filter
const filtered = events.filter((e) =>
e.title.toLowerCase().includes(search.toLowerCase())
);

// Pagination
const perPage = 10;
const totalPages = Math.ceil(filtered.length / perPage);
const paginated = filtered.slice((page - 1) * perPage, page * perPage);

return ( <Box className="flex flex-col items-center p-4">
     <SideMenu />
{/* Search Bar */}
<TextField
label="Search events..."
variant="outlined"
value={search}
onChange={(e) => { setSearch(e.target.value); setPage(1); }}
fullWidth
style={{ maxWidth: 500, marginBottom: 20 }}
/>


  {/* Table */}
  <TableContainer component={Paper} style={{ maxWidth: 1000 }}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>SR</TableCell>
          <TableCell>Title</TableCell>
          <TableCell>Description</TableCell>
          <TableCell>Location</TableCell>
          <TableCell>Price</TableCell>
          <TableCell>Images</TableCell>
          <TableCell>Approved</TableCell>
          <TableCell>Actions</TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {paginated.map((event, index) => (
          <TableRow key={event.id}>
            <TableCell>{(page - 1) * perPage + index + 1}</TableCell>
            <TableCell>{event.title}</TableCell>
            <TableCell>{event.description}</TableCell>
            <TableCell>{event.location}</TableCell>
            <TableCell>₹{event.price}</TableCell>

            {/* Images */}
            <TableCell>
              <Box sx={{ display: "flex", gap: 1 }}>
                {event.images?.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt="event"
                    style={{ width: 40, height: 40, borderRadius: 6, cursor: "pointer", objectFit: "cover", border: "1px solid #ddd" }}
                    onClick={() => setPreviewImage(img)}
                  />
                ))}
              </Box>
            </TableCell>

            {/* Approve Toggle */}
            <TableCell>
              <Switch
                checked={event.approved}
                onChange={() => openConfirmDialog("approve", event.id, `Are you sure you want to ${event.approved ? "unapprove" : "approve"} this event?`)}
                color="success"
              />
            </TableCell>

            {/* Actions */}
            <TableCell>
              <IconButton onClick={() => openConfirmDialog("delete", event.id, "Are you sure you want to delete this event?")} color="error">
                <DeleteIcon />
              </IconButton>
            </TableCell>

          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>

  {/* Pagination Buttons */}
  <Box className="flex gap-3 mt-4">
    <button disabled={page === 1} className="px-4 py-2 bg-gray-300 rounded" onClick={() => setPage(page - 1)}>Prev</button>
    <div className="px-4 py-2">Page {page} of {totalPages}</div>
    <button disabled={page === totalPages} className="px-4 py-2 bg-gray-300 rounded" onClick={() => setPage(page + 1)}>Next</button>
  </Box>

  {/* Image Preview Modal */}
  <Dialog open={!!previewImage} onClose={() => setPreviewImage(null)}>
    <IconButton onClick={() => setPreviewImage(null)} style={{ position: "absolute", top: 10, right: 10 }}>
      <CloseIcon />
    </IconButton>
    <DialogContent>
      <img src={previewImage} alt="preview" style={{ maxWidth: "100%", borderRadius: 10 }} />
    </DialogContent>
  </Dialog>

  {/* Confirmation Dialog */}
  <Dialog open={confirmDialog.open} onClose={handleCancel}>
    <DialogContent>{confirmDialog.message}</DialogContent>
    <DialogActions>
      <Button onClick={handleCancel}>Cancel</Button>
      <Button onClick={handleConfirm} color="primary">Yes</Button>
    </DialogActions>
  </Dialog>
</Box>


);
}
