import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import Home from "./pages/Home";
import Alunos from "./pages/Alunos";
import Turmas from "./pages/Turmas";
import Matriculas from "./pages/Matriculas";
import Mensalidades from "./pages/Mensalidades";
import AlunoDetalhes from "./pages/AlunoDetalhes";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/alunos" element={<Alunos />} />
          <Route path="/alunos/:id" element={<AlunoDetalhes />} />
          <Route path="/turmas" element={<Turmas />} />
          <Route path="/matriculas" element={<Matriculas />} />
          <Route path="/mensalidades" element={<Mensalidades />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}