#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const errors = [];
const protocolPath = "docs/PROTOCOLO-PROMPTARIA-NOCTURNA.md";
const coveragePath = "docs/REGISTRO-COBERTURA-PROMPTARIA-NOCTURNA.md";
const fail = message => errors.push(message);

if (!fs.existsSync(path.join(root, protocolPath))) {
  fail(`protocolo normativo ausente: ${protocolPath}`);
} else {
  const text = fs.readFileSync(path.join(root, protocolPath), "utf8");
  const required = [
    "## 1. Finalidade e limites",
    "## 2. Referência filosófica normativa",
    "## 3. Ostensividade e fidelidade",
    "## 4. Recuperação documental do acervo Nocturna",
    "### 4.1. Leitura de publicações e coleções somente sob demanda",
    "A leitura do conteúdo das publicações, coleções e demais unidades editoriais do repositório Nocturna é condicionada a uma solicitação do usuário.",
    "Não iniciar varreduras, leituras integrais, atualizações de inventário baseadas em leitura de conteúdo ou monitoramento contínuo do acervo sem uma demanda pertinente.",
    "## 5. Ciclo operacional por demanda",
    "## 6. Controle de cobertura e integridade",
    "## 7. Continuidade e persistência",
    "## 8. Registro mínimo por execução",
    "## 9. Critério de conformidade",
    "Quando a Nocturna for ativada como camada documental global em uma atuação Promptária–Nocturna, o padrão é inventariar e examinar integralmente todo o universo acessível de publicações, coleções e capítulos de coleções",
    "não comprova que o acervo Nocturna tenha sido integralmente recuperado ou lido",
    "Lido integralmente",
    "Lido parcialmente",
    "Identificado, não lido",
    "Inacessível ou pendente"
  ];
  for (const phrase of required) {
    if (!text.includes(phrase)) fail(`protocolo: seção ou salvaguarda obrigatória ausente -> ${phrase}`);
  }
  if (text.trim().length < 4000) fail("protocolo: conteúdo inesperadamente curto; verificar truncamento");
}

if (!fs.existsSync(path.join(root, coveragePath))) {
  fail(`modelo de registro de cobertura ausente: ${coveragePath}`);
} else {
  const coverage = fs.readFileSync(path.join(root, coveragePath), "utf8");
  const coverageRequired = [
    "## 1. Identificação da execução",
    "## 2. Decisão de consulta",
    "## 3. Fontes e universo considerado",
    "## 4. Estado de cobertura por unidade",
    "Lido integralmente",
    "Lido parcialmente",
    "Identificado, não lido",
    "Inacessível ou pendente",
    "Fora do escopo",
    "Evidência verificável",
    "## 7. Limitações e estado final",
    "memória global no ChatGPT"
  ];
  for (const phrase of coverageRequired) {
    if (!coverage.includes(phrase)) fail(`registro de cobertura: campo ou salvaguarda obrigatória ausente -> ${phrase}`);
  }
  if (coverage.trim().length < 2000) fail("registro de cobertura: conteúdo inesperadamente curto; verificar truncamento");
}

if (errors.length) {
  console.error("FALHAS NA VALIDAÇÃO DO PROTOCOLO:\\n" + errors.join("\\n"));
  process.exit(1);
}
console.log("OK: protocolo Promptaria/Nocturna e modelo de cobertura presentes; leitura sob demanda, estados, evidências e limites verificados.");
