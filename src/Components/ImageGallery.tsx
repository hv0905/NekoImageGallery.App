import { Box, Paper } from "@mui/material";
import { SearchResult } from "../Models/SearchResult";
import { Environment } from "../environment";
import { useEffect, useRef } from "react";
import { Fancybox } from "@fancyapps/ui";

export function ImageGallery({
  searchResult,
}: {
  searchResult: SearchResult[];
}) {
  const containerRef = useRef(null);
  searchResult.forEach((t) => {
    if (t.img.url.startsWith("/")) {
      t.img.url = Environment.ApiUrl + t.img.url;
    }
  });

  useEffect(() => {
    const container = containerRef.current;

    Fancybox.bind(container, "[data-fancybox]", {
        Toolbar: {
            display: {
              left: ["infobar"],
              middle: [
                "zoomIn",
                "zoomOut",
                "toggle1to1",
                "rotateCCW",
                "rotateCW",
                "flipX",
                "flipY",
              ],
              right: ["slideshow", "download", "thumbs", "close"],
            },
          },
    });

    return () => {
      Fancybox.unbind(container);
      Fancybox.close();
    };
  });

  return (
    <Box
      ref={containerRef}
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gridAutoRows: "minmax(200px, auto)",
        justifyItems: "center",
      }}
    >
      {searchResult.map((t) => {
        return (
          <Paper
            component="a"
            data-fancybox="gallery"
            href={t.img.url}
            sx={{ margin: 1, display: "flex", alignItems: "center" }}
          >
            <img src={t.img.url} style={{ width: "100%" }} />
          </Paper>
        );
      })}
    </Box>
  );
}
