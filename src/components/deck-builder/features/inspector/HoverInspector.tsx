import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useDeckStore } from "@/store/index";
import { InspectorContent } from "./InspectorContent";
import { cn } from "@/lib/utils";

export function HoverInspector() {
  // Disabled as we now use the persistent InspectorPanel
  return null;
}
