const apiBase = "https://recepcao-academia.vercel.app";

let editando = false;
let alunoEditandoId = null;

document.addEventListener("DOMContentLoaded", async () => {
  renderizarFormulario();
  configurarFormulario();
  await carregarAlunos();
  aplicarMascaraCPF();  // Chama a função para aplicar a validação do CPF
});

function renderizarFormulario() {
  const formContainer = document.getElementById("formContainer");
  formContainer.innerHTML = `
    <form id="formAluno" class="space-y-4 w-3/4 mx-auto">
      <div>
        <label for="nomeAluno" class="block text-sm font-medium text-gray-700">Nome do Aluno</label>
        <input type="text" id="nomeAluno" required class="mt-1 block w-full border-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-300 focus:border-indigo-300 focus:outline-none bg-gray-50 text-gray-700" />
      </div>
      <div>
        <label for="cpfAluno" class="block text-sm font-medium text-gray-700">CPF</label>
        <input type="text" id="cpfAluno" required class="mt-1 block w-full border-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-300 focus:border-indigo-300 focus:outline-none bg-gray-50 text-gray-700" />
      </div>
      <div>
        <label for="statusAluno" class="block text-sm font-medium text-gray-700">Status</label>
        <select id="statusAluno" class="mt-1 block w-full border-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-300 focus:border-indigo-300 focus:outline-none bg-gray-50 text-gray-700">
          <option value="">Selecione o Status</option>
          <option value="true">Ativo</option>
          <option value="false">Inativo</option>
        </select>
      </div>
      <div class="flex space-x-2">
        <button type="submit" id="botaoCadastrar" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">Cadastrar Aluno</button>
        <button type="button" id="botaoCancelar" style="display:none;" class="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition">Cancelar</button>
      </div>
    </form>
  `;
}

function configurarFormulario() {
  const form = document.getElementById("formAluno");
  const botaoCadastrar = document.getElementById("botaoCadastrar");
  const botaoCancelar = document.getElementById("botaoCancelar");

  form.onsubmit = async (e) => {
    e.preventDefault();
    const nome = document.getElementById("nomeAluno").value;
    const cpf = document.getElementById("cpfAluno").value;
    const status = document.getElementById("statusAluno").value === "true";

    const dadosAluno = { nome, cpf, status };

    if (editando && alunoEditandoId) {
      await fetch(`${apiBase}/alunos/${alunoEditandoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosAluno),
      });
    } else {
      await fetch(`${apiBase}/alunos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosAluno),
      });
    }

    form.reset();
    editando = false;
    alunoEditandoId = null;
    botaoCadastrar.innerText = "Cadastrar Aluno";
    botaoCancelar.style.display = "none";
    await carregarAlunos();
  };

  botaoCancelar.onclick = () => {
    form.reset();
    editando = false;
    alunoEditandoId = null;
    botaoCadastrar.innerText = "Cadastrar Aluno";
    botaoCancelar.style.display = "none";
  };
}

async function carregarAlunos(filtro = null) {
  const lista = document.getElementById("listaUsuarios");
  lista.innerHTML = ""; // Limpa a lista antes de adicionar novos itens

  const resposta = await fetch(`${apiBase}/alunos`);
  const alunos = await resposta.json();

  let alunosFiltrados = alunos;
  if (filtro === "ativo") alunosFiltrados = alunos.filter(a => a.status === true);
  if (filtro === "inativo") alunosFiltrados = alunos.filter(a => a.status === false);

  // Verifica se não há alunos filtrados e exibe uma mensagem
  if (alunosFiltrados.length === 0) {
    const mensagem = document.createElement("p");
    mensagem.className = "text-center text-gray-600 font-semibold";
    mensagem.innerText = filtro === "ativo" ? "Não há usuários ativos" : "Não há usuários inativos";
    lista.appendChild(mensagem);
  } else {
    alunosFiltrados.forEach((aluno) => {
      const card = document.createElement("div");
      card.className = "bg-white p-4 rounded-lg shadow border border-gray-200";
      card.innerHTML = `
        <p class="text-lg font-semibold text-gray-800"><strong>Nome:</strong> ${aluno.nome}</p>
        <p class="text-gray-600"><strong>CPF:</strong> ${aluno.cpf}</p>
        <p class="text-gray-600"><strong>Status:</strong> 
          <span class="${aluno.status ? 'text-green-600' : 'text-red-600'} font-semibold">
            ${aluno.status ? "Ativo" : "Inativo"}
          </span>
        </p>
        <div class="mt-3 space-x-2">
          <button class="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded" onclick="editarUsuario('${aluno.id}')">Editar</button>
          <button class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded" onclick="excluirUsuario('${aluno.id}')">Excluir</button>
        </div>
      `;
      lista.appendChild(card);
    });
  }
}

async function editarUsuario(id) {
  const resposta = await fetch(`${apiBase}/alunos/id/${id}`);
  const aluno = await resposta.json();

  document.getElementById("nomeAluno").value = aluno.nome;
  document.getElementById("cpfAluno").value = aluno.cpf;
  document.getElementById("statusAluno").value = aluno.status.toString();

  editando = true;
  alunoEditandoId = id;
  document.getElementById("botaoCadastrar").innerText = "Salvar Alterações";
  document.getElementById("botaoCancelar").style.display = "inline-block";

  document.getElementById("formContainer").scrollIntoView({ behavior: "smooth" });
}

async function excluirUsuario(id) {
  if (confirm("Tem certeza que deseja excluir este aluno?")) {
    await fetch(`${apiBase}/alunos/${id}`, {
      method: "DELETE",
    });
    await carregarAlunos();
  }
}

function aplicarMascaraCPF() {
  const cpfInput = document.getElementById("cpfAluno");

  cpfInput.addEventListener("input", (e) => {
    let cpf = e.target.value;

    // Remove qualquer caractere que não seja número
    cpf = cpf.replace(/\D/g, '');

    // Limita o CPF a 11 dígitos
    if (cpf.length > 11) {
      cpf = cpf.slice(0, 11);
    }

    // Atualiza o valor do campo com o CPF sem formatação
    e.target.value = cpf;
  });
}

let alunosFiltrados = [];

async function carregarAlunos(filtro = null) {
  const lista = document.getElementById("listaUsuarios");
  lista.innerHTML = ""; // Limpa a lista antes de adicionar novos itens

  const resposta = await fetch(`${apiBase}/alunos`);
  const alunos = await resposta.json();

  if (filtro === "ativo") alunosFiltrados = alunos.filter(a => a.status === true);
  else if (filtro === "inativo") alunosFiltrados = alunos.filter(a => a.status === false);
  else alunosFiltrados = alunos;

  // Exibe os alunos filtrados ou todos
  if (alunosFiltrados.length === 0) {
    const mensagem = document.createElement("p");
    mensagem.className = "text-center text-gray-600 font-semibold";
    mensagem.innerText = filtro === "ativo" ? "Não há usuários ativos" : filtro === "inativo" ? "Não há usuários inativos" : "Não há alunos cadastrados";
    lista.appendChild(mensagem);
  } else {
    alunosFiltrados.forEach((aluno) => {
      const card = document.createElement("div");
      card.className = "bg-white p-4 rounded-lg shadow border border-gray-200";
      card.innerHTML = `
        <p class="text-lg font-semibold text-gray-800"><strong>Nome:</strong> ${aluno.nome}</p>
        <p class="text-gray-600"><strong>CPF:</strong> ${aluno.cpf}</p>
        <p class="text-gray-600"><strong>Status:</strong> 
          <span class="${aluno.status ? 'text-green-600' : 'text-red-600'} font-semibold">
            ${aluno.status ? "Ativo" : "Inativo"}
          </span>
        </p>
        <div class="mt-3 space-x-2">
          <button class="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded" onclick="editarUsuario('${aluno.id}')">Editar</button>
          <button class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded" onclick="excluirUsuario('${aluno.id}')">Excluir</button>
        </div>
      `;
      lista.appendChild(card);
    });
  }
}

// Função para filtrar alunos pelo nome
function filtrarAlunos() {
  const nomeBusca = document.getElementById("buscaAluno").value.toLowerCase();
  const lista = document.getElementById("listaUsuarios");

  // Filtra os alunos com base no nome digitado
  const alunosFiltradosBusca = alunosFiltrados.filter(aluno => aluno.nome.toLowerCase().includes(nomeBusca));

  // Limpa a lista antes de adicionar os alunos filtrados
  lista.innerHTML = "";

  // Exibe os alunos filtrados pela busca
  if (alunosFiltradosBusca.length === 0) {
    const mensagem = document.createElement("p");
    mensagem.className = "text-center text-gray-600 font-semibold";
    mensagem.innerText = "Nenhum aluno encontrado";
    lista.appendChild(mensagem);
  } else {
    alunosFiltradosBusca.forEach((aluno) => {
      const card = document.createElement("div");
      card.className = "bg-white p-4 rounded-lg shadow border border-gray-200";
      card.innerHTML = `
        <p class="text-lg font-semibold text-gray-800"><strong>Nome:</strong> ${aluno.nome}</p>
        <p class="text-gray-600"><strong>CPF:</strong> ${aluno.cpf}</p>
        <p class="text-gray-600"><strong>Status:</strong> 
          <span class="${aluno.status ? 'text-green-600' : 'text-red-600'} font-semibold">
            ${aluno.status ? "Ativo" : "Inativo"}
          </span>
        </p>
        <div class="mt-3 space-x-2">
          <button class="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded" onclick="editarUsuario('${aluno.id}')">Editar</button>
          <button class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded" onclick="excluirUsuario('${aluno.id}')">Excluir</button>
        </div>
      `;
      lista.appendChild(card);
    });
  }
}

