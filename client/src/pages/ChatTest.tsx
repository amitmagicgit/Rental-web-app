import React, { useState } from 'react';
import { Box, Button, Container, Paper, Typography, Tab, Tabs, TextField } from '@mui/material';

const defaultRecentFilters = {
  minPrice: 3000,
  maxPrice: 8000,
  minSize: 50,
  maxSize: 120,
  neighborhoods: ["לב תל אביב", "פלורנטיין"],
  minRooms: 2,
  maxRooms: 4,
  balcony: ["yes"],
  agent: ["yes"],
  parking: ["yes"],
  furnished: ["yes"],
  includeZeroPrice: true,
  includeZeroSize: true,
  includeZeroRooms: true
};

const defaultByIdRequest = {
  postId: "123456789"
};

export default function ChatTest() {
  const [activeTab, setActiveTab] = useState(0);
  const [recentFilters, setRecentFilters] = useState(JSON.stringify(defaultRecentFilters, null, 2));
  const [byIdRequest, setByIdRequest] = useState(JSON.stringify(defaultByIdRequest, null, 2));
  const [recentResponse, setRecentResponse] = useState<string | null>(null);
  const [byIdResponse, setByIdResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setError(null);
  };

  const testRecentListings = async () => {
    try {
      setError(null);
      const filters = JSON.parse(recentFilters);
      const response = await fetch('/api/chat/listing/recent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setRecentResponse(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const testById = async () => {
    try {
      setError(null);
      const request = JSON.parse(byIdRequest);
      const response = await fetch('/api/chat/listing/by-id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setByIdResponse(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Chat API Test Page
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Recent Listings" />
          <Tab label="Get By ID" />
        </Tabs>
      </Box>

      {error && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: 'error.light' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}

      {activeTab === 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Test Recent Listings
          </Typography>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Request Body:
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={10}
              value={recentFilters}
              onChange={(e) => setRecentFilters(e.target.value)}
              sx={{ fontFamily: 'monospace' }}
            />
          </Paper>
          <Button variant="contained" onClick={testRecentListings} sx={{ mb: 2 }}>
            Test Recent Listings
          </Button>
          {recentResponse && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Response:
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={15}
                value={recentResponse}
                InputProps={{ readOnly: true }}
                sx={{ fontFamily: 'monospace' }}
              />
            </Paper>
          )}
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Test Get By ID
          </Typography>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Request Body:
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={10}
              value={byIdRequest}
              onChange={(e) => setByIdRequest(e.target.value)}
              sx={{ fontFamily: 'monospace' }}
            />
          </Paper>
          <Button variant="contained" onClick={testById} sx={{ mb: 2 }}>
            Test Get By ID
          </Button>
          {byIdResponse && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Response:
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={15}
                value={byIdResponse}
                InputProps={{ readOnly: true }}
                sx={{ fontFamily: 'monospace' }}
              />
            </Paper>
          )}
        </Box>
      )}
    </Container>
  );
} 