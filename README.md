# doc_qna_agent
- A Technical Documentation Q&amp;A Agent is a valuable tool for onboarding developers, resolving doubts quickly, and ensuring knowledge continuity across teams. Let’s dive deeper into what this project looks like and how you can make it production-grade.

## 📁 Project Structure

```
doc-qna-agent/
├── backend/ (agent-server)
│   ├── src/
│   │   ├── main.py
│   │   ├── routes/
│   │   │   ├── upload.py
│   │   │   └── query.py
│   │   ├── services/
│   │   │   ├── database.py
│   │   │   └── llm.py
│   │   ├── models/
│   │   │   └── upload.py
│   │   ├── tests/
│   └── uploaded_docs/
│
├── frontend/ (agent-ui)
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── UploadForm.tsx
│   │   │   └── QueryBox.tsx
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
└── README.md
```

---