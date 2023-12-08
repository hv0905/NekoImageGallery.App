import { Box, Button, Tab, Tabs, TextField } from "@mui/material";
import { SearchQuery, TextSearchQuery } from "../Models/SearchQuery";
import { useState } from "react";

export function QueryArea({
  onSubmit,
}: {
  onSubmit?: (query: SearchQuery) => void;
}) {
  const [tab, setTab] = useState(0);
  const [textPrompt, setTextPrompt] = useState("");

  const handleTextSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit?.(new TextSearchQuery(textPrompt));
  };

  const handleImageSearch = () => {

  };

  const inputs = [
      <Box component="form" sx={{width: '100%', display: "flex", gap: 1}} onSubmit={handleTextSubmit}>
        <TextField
          sx={{ flexGrow: 1 }}
          label="Search..."
          variant="outlined"
          value={textPrompt}
          onChange={(e) => setTextPrompt(e.target.value)}
        />
        <Button type="submit" variant="contained" disabled={textPrompt.length < 3}>
          Search
        </Button>
      </Box>,
    <Box>
        
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
      }}
    >
      <Tabs value={tab} onChange={(_, v) => setTab(v)}>
        <Tab label="Text Search" />
        <Tab label="Image Search" />
      </Tabs>
      {inputs[tab]}
    </Box>
  );
}
