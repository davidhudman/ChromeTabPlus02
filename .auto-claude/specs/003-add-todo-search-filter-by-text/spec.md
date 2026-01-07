# Add todo search/filter by text

## Overview

Add a search input above the Kanban board that filters todos by matching text in title or description. This allows users with many todos to quickly find specific items without scrolling through all columns.

## Rationale

The refreshTodoList() and renderBoard() functions already filter todos by project (currentProjectId). Adding text filter would extend this existing filter logic. The pattern of getting todos from storage, filtering, and rendering is well established.

---
*This spec was created from ideation and is pending detailed specification.*
