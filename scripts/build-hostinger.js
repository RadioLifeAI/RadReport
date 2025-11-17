#!/usr/bin/env node

/**
 * Script de build otimizado para Hostinger
 * Cria um build otimizado com informações de versão e timestamp
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obter __dirname em módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cores para output
const colors = {
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logStep(step, message) {
  console.log(`\n${colors.blue}${colors.bold}[${step}]${colors.reset} ${message}`);
}

function logSuccess(message) {
  console.log(`${colors.green}✅ ${message}${colors.reset}`);
}

function logError(message) {
  console.log(`${colors.red}❌ ${message}${colors.reset}`);
}

function logWarning(message) {
  console.log(`${colors.yellow}⚠️ ${message}${colors.reset}`);
}

// Função principal
async function buildForHostinger() {
  try {
    log(`${colors.bold}${colors.blue}🚀 Iniciando build otimizado para Hostinger...${colors.reset}\n`);

    // 1. Obter informações do Git e do projeto
    logStep('1/6', 'Obtendo informações do projeto...');
    
    let gitHash, gitBranch, lastCommitDate;
    try {
      gitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
      gitBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
      lastCommitDate = execSync('git log -1 --format=%cd --date=iso', { encoding: 'utf8' }).trim();
    } catch (error) {
      logWarning('Não foi possível obter informações do Git, usando valores padrão');
      gitHash = 'unknown';
      gitBranch = 'main';
      lastCommitDate = new Date().toISOString();
    }

    // Ler package.json
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const appVersion = packageJson.version || '1.0.0';
    const appName = packageJson.name || 'radreport';
    
    const buildTimestamp = new Date().toISOString();
    const buildVersion = `${appVersion}-${gitHash}`;

    logSuccess(`Versão: ${appVersion}`);
    logSuccess(`Git Hash: ${gitHash}`);
    logSuccess(`Branch: ${gitBranch}`);
    logSuccess(`Build Time: ${buildTimestamp}`);

    // 2. Limpar build anterior
    logStep('2/6', 'Limpando build anterior...');
    const distPath = path.join(__dirname, '..', 'dist');
    if (fs.existsSync(distPath)) {
      fs.rmSync(distPath, { recursive: true, force: true });
      logSuccess('Build anterior removido');
    }

    // 3. Executar build do Vite
    logStep('3/6', 'Executando build do Vite...');
    
    // Definir variáveis de ambiente para o build
    process.env.BUILD_VERSION = buildVersion;
    process.env.BUILD_TIMESTAMP = buildTimestamp;
    process.env.GIT_HASH = gitHash;
    process.env.GIT_BRANCH = gitBranch;
    process.env.NODE_ENV = 'production';

    // Executar build
    try {
      execSync('npm run build', { 
        stdio: 'inherit',
        cwd: path.join(__dirname, '..'),
        env: { ...process.env, ...process.env }
      });
      logSuccess('Build do Vite concluído com sucesso');
    } catch (error) {
      logError('Erro ao executar build do Vite');
      throw error;
    }

    // 4. Criar arquivo de versão
    logStep('4/6', 'Criando arquivo de versão...');
    
    const versionInfo = {
      name: appName,
      version: appVersion,
      buildVersion: buildVersion,
      gitHash: gitHash,
      gitBranch: gitBranch,
      buildTimestamp: buildTimestamp,
      lastCommitDate: lastCommitDate,
      nodeVersion: process.version,
      environment: 'production',
      deployedAt: null // Será preenchido pelo workflow
    };

    const versionPath = path.join(distPath, 'version.json');
    fs.writeFileSync(versionPath, JSON.stringify(versionInfo, null, 2));
    logSuccess('Arquivo version.json criado');

    // 5. Criar arquivo de saúde/health check
    logStep('5/6', 'Criando arquivo de health check...');
    
    const healthInfo = {
      status: 'healthy',
      timestamp: buildTimestamp,
      version: buildVersion,
      uptime: 0,
      environment: 'production'
    };

    const healthPath = path.join(distPath, 'health.json');
    fs.writeFileSync(healthPath, JSON.stringify(healthInfo, null, 2));
    logSuccess('Arquivo health.json criado');

    // 6. Estatísticas do build
    logStep('6/6', 'Analisando resultado do build...');
    
    function getDirectorySize(dirPath) {
      let totalSize = 0;
      const files = fs.readdirSync(dirPath);
      
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isDirectory()) {
          totalSize += getDirectorySize(filePath);
        } else {
          totalSize += stats.size;
        }
      }
      
      return totalSize;
    }

    const totalSize = getDirectorySize(distPath);
    const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);

    // Contar arquivos
    function countFiles(dirPath) {
      let count = 0;
      const files = fs.readdirSync(dirPath);
      
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isDirectory()) {
          count += countFiles(filePath);
        } else {
          count++;
        }
      }
      
      return count;
    }

    const totalFiles = countFiles(distPath);

    // Listar principais arquivos
    log(`\n${colors.bold}📁 Arquivos principais:${colors.reset}`);
    const mainFiles = fs.readdirSync(distPath);
    mainFiles.forEach(file => {
      const filePath = path.join(distPath, file);
      const stats = fs.statSync(filePath);
      const size = stats.isDirectory() ? getDirectorySize(filePath) : stats.size;
      const sizeKB = (size / 1024).toFixed(1);
      const type = stats.isDirectory() ? '📂' : '📄';
      log(`  ${type} ${file} (${sizeKB} KB)`);
    });

    // Resultado final
    log(`\n${colors.green}${colors.bold}🎉 Build concluído com sucesso!${colors.reset}`);
    log(`📊 Estatísticas:`);
    log(`   📁 Total de arquivos: ${totalFiles}`);
    log(`   💾 Tamanho total: ${totalSizeMB} MB`);
    log(`   🔢 Versão: ${buildVersion}`);
    log(`   ⏰ Build time: ${buildTimestamp}`);
    log(`\n${colors.yellow}📋 Próximos passos:${colors.reset}`);
    log(`   1. Configure os secrets FTP no GitHub`);
    log(`   2. O deploy automático será acionado no push`);
    log(`   3. Acesse https://radreport.com.br para verificar`);
    log(`   4. Verifique https://radreport.com.br/version.json`);

  } catch (error) {
    logError(`Erro durante o build: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  buildForHostinger();
}

export { buildForHostinger };