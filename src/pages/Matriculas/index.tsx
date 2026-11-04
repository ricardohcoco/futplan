import { useEffect, useState } from "react";
import styles from "./Matriculas.module.css";
import type { Aluno } from "../../types/aluno";
import type { TurmaComDias } from "../../types/turma";
import type { MatriculaComDetalhes, NovaMatricula } from "../../types/matricula";
import { listarAlunos } from "../../services/alunos";
import { listarTurmas } from "../../services/turmas";
import { cadastrarMatricula, encerrarMatricula, listarMatriculas } from "../../services/matriculas";
import MatriculaForm from "../../components/matriculas/MatriculaForm";
import MatriculasList from "../../components/matriculas/MatriculasList";

export default function Matriculas() {
    const [alunos, setAlunos] = useState<Aluno[]>([]);
    const [turmas, setTurmas] = useState<TurmaComDias[]>([]);
    const [matriculas, setMatriculas] = useState<MatriculaComDetalhes[]>([]);

    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState("");
    const [mensagem, setMensagem] = useState("");

    useEffect(() => {
        async function carregarDados() {
            try {
                const [alunosCarregados, turmasCarregadas, matriculasCarregadas] =
                    await Promise.all([
                        listarAlunos(),
                        listarTurmas(),
                        listarMatriculas(),
                    ]);
                
                setAlunos(alunosCarregados);
                setTurmas(turmasCarregadas);
                setMatriculas(matriculasCarregadas);
            } catch (error) {
                setErro(
                    error instanceof Error
                    ? error.message
                    : "Não foi possível carregar os dados."
                );
            } finally {
                setCarregando(false);
            }
        }

        carregarDados();
    }, []);

    async function handleSalvar(dados: NovaMatricula): Promise<boolean> {
        setSalvando(true);
        setErro("");
        setMensagem("");

        try {
            const novaMatricula = await cadastrarMatricula(dados);

            setMatriculas((anteriores) => [novaMatricula, ...anteriores]);
            setMensagem("Matrícula cadastrada com sucesso!");

            return true;
        } catch (error) {
            setErro(
                error instanceof Error
                ? error.message
                : "Não foi possível cadastrar a matrícula."
            );

            return false;
        } finally {
            setSalvando(false);
        }
    }

    async function handleEncerrar(matricula: MatriculaComDetalhes) {
        const confirmou = window.confirm(
            `Deseja encerrar a matrícula de ${matricula.alunos.nome} na turma ${matricula.turmas.nome}?`
        );

        if (!confirmou) return;
        
        setSalvando(true);
        setErro("");
        setMensagem("");

        try {
            const matriculaEncerrada = await encerrarMatricula(matricula.id);

            setMatriculas((anteriores) =>
            anteriores.map((item) =>
            item.id === matriculaEncerrada.id
            ? matriculaEncerrada
            : item));

            setMensagem("Matrícula encerrada com sucesso!");
        } catch (error) {
            setErro(
                error instanceof Error
                ? error.message
                : "Não foi possível encerrar a matrícula."
            );
        } finally {
            setSalvando(false);
        }
    }

    return (
        <main className={styles.container}>
            <header className={styles.header}>
                <h1>Matrículas</h1>
                <p>Vincule alunos às turmas e consulte as matrículas cadastradas.</p>
            </header>

            {erro && <p className={styles.erro}>{erro}</p>}
            {mensagem && <p className={styles.sucesso}>{mensagem}</p>}

            {carregando ? (
                <p>Carregando dados...</p>
            ) : (
                <>
                    <MatriculaForm
                        alunos={alunos}
                        turmas={turmas}
                        matriculas={matriculas}
                        salvando={salvando}
                        onSalvar={handleSalvar}
                    />

                    <MatriculasList
                        matriculas={matriculas}
                        carregando={false}
                        salvando={salvando}
                        onEncerrar={handleEncerrar}
                    />
                </>
            )}
        </main>
    );
}