# SyncUp UML Diagrams Collection

Complete set of 13 UML diagrams for the SyncUp project (Smart Hybrid Workplace Presence Platform).

## 📋 Diagram Files (Editable `.mmd` Format)

All diagrams are saved in Mermaid format and can be edited directly in any text editor.

| # | File | Type | Description |
|---|------|------|-------------|
| 1 | `01-system-architecture.mmd` | Component | High-level system architecture and components |
| 2 | `02-authentication-login.mmd` | Sequence | JWT authentication and login flow |
| 3 | `03-status-update-realtime.mmd` | Sequence | Status update with real-time broadcasting |
| 4 | `04-team-management.mmd` | Sequence | Team CRUD operations and member management |
| 5 | `05-team-dashboard.mmd` | Sequence | Team dashboard with live updates |
| 6 | `06-domain-model.mmd` | Class | Database entities and relationships |
| 7 | `07-user-journey.mmd` | Activity | Complete user workflow from login to logout |
| 8 | `08-data-flow.mmd` | Data Flow | Layer-by-layer data transformation |
| 9 | `09-deployment-architecture.mmd` | Deployment | Docker container architecture |
| 10 | `10-jwt-security.mmd` | Sequence | JWT token lifecycle and security |
| 11 | `11-websocket-messages.mmd` | Sequence | WebSocket/STOMP real-time messaging |
| 12 | `12-error-handling.mmd` | Activity | Exception handling and error responses |
| 13 | `13-frontend-components.mmd` | Component | React component architecture |

---

## 🔍 Viewing the Diagrams

### Option 1: Online Mermaid Viewers
Use any of these free online tools to view and edit the `.mmd` files:

1. **Mermaid Live Editor** - https://mermaid.live
   - Upload or paste the `.mmd` file contents
   - Edit live and see changes
   - Export to PNG, SVG, or PDF

2. **Draw.io** - https://draw.io
   - Import Mermaid diagrams
   - Full editing capabilities
   - Export in multiple formats

3. **Excalidraw** - https://excalidraw.com
   - Supports Mermaid rendering
   - Great for collaborative editing

### Option 2: VS Code Integration
If you use VS Code, install these extensions:

1. **Mermaid Markdown Syntax Highlighting** (`bpruitt-goddard.mermaid-markdown-syntax-highlighting`)
2. **Markdown Preview Mermaid Support** (`bierner.markdown-mermaid`)

Then open the `.mmd` files directly in VS Code to see a live preview.

### Option 3: Git Integration
If hosted on GitHub, Mermaid diagrams render automatically in `.mmd` files.

### Option 4: Browser Plugins
- **Mermaid Viewer** - Chrome/Firefox browser plugin for auto-rendering

---

## 🖼️ Converting to Image Files

### Method 1: Using Mermaid CLI (Recommended)

**Installation:**
```bash
npm install -g @mermaid-js/mermaid-cli
```

**Convert Single File to PNG:**
```bash
mmdc -i docs/uml/01-system-architecture.mmd -o docs/uml/01-system-architecture.png
```

**Convert Single File to SVG:**
```bash
mmdc -i docs/uml/01-system-architecture.mmd -o docs/uml/01-system-architecture.svg
```

**Batch Convert All Files:**
```bash
for file in docs/uml/*.mmd; do
    mmdc -i "$file" -o "${file%.mmd}.png"
    mmdc -i "$file" -o "${file%.mmd}.svg"
done
```

### Method 2: Using Online Tools

1. Go to https://mermaid.live
2. Paste diagram content
3. Click **Download** → Select **PNG** or **SVG**

### Method 3: Using Docker

```bash
docker run -v $(pwd)/docs/uml:/data mermaid-cli \
    mmdc -i /data/01-system-architecture.mmd \
    -o /data/01-system-architecture.png
```

---

## ✏️ Editing the Diagrams

### In Text Editor
- Open any `.mmd` file in VS Code, Sublime, etc.
- Edit Mermaid syntax directly
- Save and regenerate images

### In Mermaid Live Editor
1. Go to https://mermaid.live
2. Click **Upload** → Select `.mmd` file
3. Edit the diagram
4. Export the updated `.mmd` file

### Common Edits

**Change Colors:**
```mermaid
style NodeName fill:#e3f2fd
```

**Add/Remove Nodes:**
```mermaid
NodeName["Label"]
```

**Modify Connections:**
```mermaid
NodeA -->|label| NodeB
```

**Update Text:**
- Simply edit the text within quotes

---

## 📐 Diagram Types Explained

### Sequence Diagrams (`.mmd`)
- Show interactions between components over time
- Files: 02, 03, 04, 05, 10, 11

**Viewing Tip:** Read from top to bottom to follow the flow

### Component Diagrams (`.mmd`)
- Show system architecture and relationships
- Files: 01, 13

**Viewing Tip:** Understand the overall structure first

### Class Diagram (`.mmd`)
- Show data entities and relationships
- File: 06

**Viewing Tip:** Useful for database design understanding

### Activity Diagrams (`.mmd`)
- Show user workflows and processes
- Files: 07, 12

**Viewing Tip:** Follow the decision paths and flows

### Data Flow Diagram (`.mmd`)
- Show layer-by-layer transformations
- File: 08

**Viewing Tip:** Trace data from input to output

### Deployment Diagram (`.mmd`)
- Show system deployment and containers
- File: 09

**Viewing Tip:** Understand infrastructure setup

---

## 🚀 Quick Start Guide

### 1. View All Diagrams Online
```bash
# Copy all .mmd files content and open in https://mermaid.live
```

### 2. Generate PNG Images
```bash
npm install -g @mermaid-js/mermaid-cli
cd docs/uml
for file in *.mmd; do mmdc -i "$file" -o "${file%.mmd}.png"; done
```

### 3. View in VS Code
```bash
# Install extension: bierner.markdown-mermaid
# Open any .mmd file - instant preview
```

### 4. Add to Documentation
Include in your README or docs:
```markdown
![System Architecture](docs/uml/01-system-architecture.png)
```

---

## 📊 Documentation Mapping

These diagrams correspond to the documentation:

- **UML_DIAGRAMS_SUMMARY.md** - Detailed explanation of all diagrams
- **QUICK_REFERENCE.md** - Quick lookup guide
- Each `.mmd` file - Editable source

---

## 💡 Best Practices

1. **Keep Editable**: Always maintain `.mmd` files as source of truth
2. **Version Control**: Commit `.mmd` files to git
3. **Generate on CI**: Use CI/CD to auto-generate images
4. **Update Together**: When code changes, update diagrams
5. **Comment Changes**: Add notes when updating diagrams

---

## 🔗 Integration with Projects

### GitHub
- Mermaid diagrams render automatically in `.md` files
- `.mmd` files display with syntax highlighting

### Confluence
- Use Mermaid macro plugin
- Paste diagram content directly

### Notion
- Embed images generated from `.mmd` files
- Use database to link diagrams

### Jira
- Attach images to issues
- Reference diagrams in documentation

### Presentation Slides
- Export `.mmd` files to PNG/SVG
- Insert into PowerPoint, Keynote, Google Slides

---

## 🎯 Use Cases

### Team Onboarding
1. Use `07-user-journey.mmd` to explain user workflows
2. Use `01-system-architecture.mmd` for system overview
3. Use `06-domain-model.mmd` for database understanding

### Architecture Review
1. Review `01-system-architecture.mmd`
2. Review `09-deployment-architecture.mmd`
3. Discuss trade-offs and improvements

### Development Planning
1. Reference sequence diagrams for API design
2. Use data flow diagram for performance planning
3. Check component diagram for module dependencies

### Documentation
1. Include diagrams in README
2. Add to API documentation
3. Create runbooks for operations

---

## 📝 Notes

- **Mermaid Version**: Diagrams use standard Mermaid v10 syntax
- **Browser Support**: Works in modern browsers (Chrome, Firefox, Safari, Edge)
- **Rendering**: Instant rendering with live-server or VS Code extension
- **Export Quality**: PNG at 2x resolution for better clarity

---

## 🆘 Troubleshooting

### Diagram Not Rendering
- Check Mermaid syntax: https://mermaid.js.org
- Paste content in Mermaid Live to validate
- Look for unclosed quotes or brackets

### Image Export Not Working
- Ensure `@mermaid-js/mermaid-cli` is installed
- Check file permissions
- Try online tool as fallback

### Colors Not Showing
- Verify hex color codes are valid
- Ensure style syntax is correct
- Try different background colors

---

## 📚 Resources

- **Mermaid Docs**: https://mermaid.js.org
- **Mermaid Live**: https://mermaid.live
- **UML Standards**: https://www.uml.org
- **System Design**: https://www.youtube.com/watch?v=... (system design videos)

---

**Created**: May 13, 2024  
**Format**: Mermaid (`.mmd`)  
**Diagrams**: 13 comprehensive diagrams  
**Project**: SyncUp - Smart Hybrid Workplace Presence Platform
