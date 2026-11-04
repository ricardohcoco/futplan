export function calcularIdade(dataNascimento: string): number {
    const [ano, mes, dia] = dataNascimento.split("-").map(Number);

    const hoje = new Date();

    let idade = hoje.getFullYear() - ano;

    const aindaNaoFezAniversario =
        hoje.getMonth() + 1 < mes ||
        (hoje.getMonth() + 1 === mes && hoje.getDate() < dia);

    if (aindaNaoFezAniversario) {
        idade--;
    }

    return idade;
}