import { BrowserRouter, Route, Routes } from "react-router-dom";
import { SignInPage } from "./pages/SignIn";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/sign-in" element={<SignInPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
