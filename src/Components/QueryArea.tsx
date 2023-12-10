import {
  Alert,
  Box,
  Button,
  Card,
  Collapse,
  IconButton,
  Tab,
  Tabs,
  TextField,
} from "@mui/material";
import {
  ImageSearchQuery,
  RandomSearchQuery,
  SearchQuery,
  TextSearchQuery,
} from "../Models/SearchQuery";
import { useState } from "react";
import { Casino, Close, Search } from "@mui/icons-material";

export function QueryArea({
  onSubmit,
}: {
  onSubmit?: (query: SearchQuery) => void;
}) {
  const [tab, setTab] = useState(0);
  const [textPrompt, setTextPrompt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const handleTextSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit?.(new TextSearchQuery(textPrompt));
  };

  const handleImageSearch = () => {
    if (file) onSubmit?.(new ImageSearchQuery(file));
  };

  const setImageFile = (file: File) => {
    console.log(file);
    if (file.type === "image/jpeg" || file.type === "image/png") {
      setFile(file);
      setFileUrl(URL.createObjectURL(file));
    } else {
      setNotificationOpen(true);
    }
  };

  const selectImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/jpeg, image/png";
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        setImageFile(files[0]);
      }
    };
    input.click();
  };

  const dropImage = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      setImageFile(files[0]);
    }
  };

  const dragOverImage = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const pasteImage = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData.items;
    if (!items) return;
    for (const item of items) {
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file) {
          setImageFile(file);
          break;
        }
      }
    }
  };

  const inputs = [
    <Box
      key={0}
      component="form"
      sx={{ width: "100%", display: "flex", gap: 1}}
      onSubmit={handleTextSubmit}
    >
      <TextField
        sx={{ flexGrow: 1 }}
        label="Search..."
        variant="outlined"
        value={textPrompt}
        onChange={(e) => setTextPrompt(e.target.value)}
      />
      <Button
        type="submit"
        variant="contained"
        disabled={textPrompt.length < 3}
        sx={{ width: "clamp(80px, 10%, 200px)" }}
        size="large"
        endIcon={<Search />}
      >
        GO
      </Button>
      <IconButton aria-label="random-pick" size="large" title="Random pick" onClick={() => onSubmit?.(new RandomSearchQuery())}>
        <Casino />
      </IconButton>
    </Box>,
    <Box
      key={1}
      sx={{ width: "100%", display: "flex", gap: 1, flexDirection: "column" }}
    >
      <Card sx={{ width: "100%", height: "200px" }}>
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          onDrop={dropImage}
          onPaste={pasteImage}
          onDragOver={dragOverImage}
        >
          {fileUrl ? (
            <img
              src={fileUrl}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            ></img>
          ) : (
            <Box>Drop or paste your image here.</Box>
          )}
        </div>
      </Card>
      <Collapse in={notificationOpen}>
        <Alert
          severity="error"
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setNotificationOpen(false)}
            >
              <Close fontSize="inherit" />
            </IconButton>
          }
          sx={{ mb: 2 }}
        >
          Invalid file type. Please select a PNG or JPEG image.
        </Alert>
      </Collapse>
      <Box display="flex" gap={2}>
        <Button fullWidth variant="outlined" onClick={selectImage}>
          Select Image
        </Button>
        <Button
          fullWidth
          variant="contained"
          disabled={!file}
          onClick={handleImageSearch}
        >
          Search
        </Button>
      </Box>
    </Box>,
  ];

  return (
    <Box
      display="flex"
      sx={{
        flexDirection: "column",
        justifyItems: "center",
        alignItems: "center",
        gap: 1.5,
        padding: 1,
      }}
    >
      <Tabs value={tab} onChange={(_, v: number) => setTab(v)}>
        <Tab label="Text Search" />
        <Tab label="Image Search" />
      </Tabs>
      {inputs[tab]}
    </Box>
  );
}
