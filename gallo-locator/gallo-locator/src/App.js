// App.js
import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Pages/Home';
import SignUp from './components/SignUp';
import Login from './components/Login';
import UserProfile from './components/UserProfile';
import LandingPage from './components/LandingPage';
import ContactPage from './components/ContactPage';
import UploadProduct from './components/UploadProduct';
import ProductDetail from './components/ProductDetail';
import EditProduct from './components/EditProduct';
import EditProfile from './components/EditProfile';
import theme from './theme';
import Layout from './components/Layout';
import { ApiKeyProvider} from "./commos/ApiKeyContext";

const App = () => {
  return (
      <ThemeProvider theme={theme}>
        <Router>
          <ApiKeyProvider> {/* Envolvemos la app con el proveedor */}
            <Layout>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/home" element={<Home />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/upload-product" element={<UploadProduct />} />
                <Route path="/product/:productId" element={<ProductDetail />} />
                <Route path="/edit-product/:productId" element={<EditProduct />} />
                <Route path="/edit-profile" element={<EditProfile />} />
              </Routes>
            </Layout>
          </ApiKeyProvider>
        </Router>
      </ThemeProvider>
  );
};

export default App;
