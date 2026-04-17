import { useEffect, useState } from "react";
import { http } from "../api/http";

export function useDashboardData(activeNotebookId) {
  const [state, setState] = useState({
    notebooks: [],
    notebookDetails: null,
    loading: true,
    error: ""
  });

  async function loadNotebooks() {
    const response = await http.get("/notebooks");
    return response.data.notebooks;
  }

  async function refresh() {
    setState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const notebooks = await loadNotebooks();
      let notebookDetails = null;

      if (activeNotebookId) {
        const detailResponse = await http.get(`/notebooks/${activeNotebookId}`);
        notebookDetails = detailResponse.data;
      } else if (notebooks[0]) {
        const detailResponse = await http.get(`/notebooks/${notebooks[0]._id}`);
        notebookDetails = detailResponse.data;
      }

      setState({
        notebooks,
        notebookDetails,
        loading: false,
        error: ""
      });
    } catch (error) {
      setState((current) => ({
        ...current,
        loading: false,
        error: error.response?.data?.message || "Failed to load dashboard data"
      }));
    }
  }

  useEffect(() => {
    refresh();
  }, [activeNotebookId]);

  return {
    ...state,
    refresh
  };
}
