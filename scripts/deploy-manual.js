#!/usr/bin/env node

/**
 * Script de deploy manual para Hostinger
 * Deploy via FTP com interface interativa
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

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
  bold: '\x1b[1m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
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

function logInfo(message) {
  console.log(`${colors.cyan}ℹ️ ${message}${colors.reset}`);
}

// Interface para entrada de dados
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(`${colors.cyan}${prompt}${colors.reset}`, (answer) => {
      resolve(answer.trim());
    });
  });
}

function questionPassword(prompt) {
  return new Promise((resolve) => {
    // Esconder a senha digitada
    const stdin = process.stdin;
    const wasRaw = stdin.isRaw;
    
    if (stdin.isTTY) {
      stdin.setRawMode(true);
    }
    
    process.stdout.write(`${colors.cyan}${prompt}${colors.reset}`);
    
    let password = '';
    
    stdin.on('data', (char) => {
      const str = char.toString();
      
      switch (str) {
        case '\n':
        case '\r':
        case '\u0004': // Ctrl+D
          if (stdin.isTTY) {
            stdin.setRawMode(wasRaw);
          }
          stdin.pause();
          stdin.removeAllListeners('data');
          process.stdout.write('\n');
          resolve(password);
          break;
        case '\u0003': // Ctrl+C
          if (stdin.isTTY) {
            stdin.setRawMode(wasRaw);
          }
          stdin.pause();
          process.stdout.write('\n');
          process.exit(1);
          break;
        case '\u007f': // Backspace
          if (password.length > 0) {
            password = password.slice(0, -1);
            process.stdout.write('\b \b');
          }
          break;
        default:
          password += str;
          process.stdout.write('*');
          break;
      }
    });
  });
}

// Função para testar conexão FTP
async function testFTPConnection(host, user, pass) {
  logInfo('Testando conexão FTP...');
  
  try {
    // Testar conexão com ftp
    const testCommand = `ftp -n ${host} <<EOF
quote USER ${user}
quote PASS ${pass}
pwd
quit
EOF`;
    
    execSync(testCommand, { stdio: 'pipe', timeout: 10000 });
    logSuccess('Conexão FTP testada com sucesso!');
    return true;
  } catch (error) {
    logError('Falha na conexão FTP. Verifique as credenciais.');
    return false;
  }
}

// Função para fazer upload via FTP
async function uploadViaFTP(host, user, pass, localDir, remoteDir) {
  logStep('6/7', 'Fazendo upload via FTP...');
  
  try {
    // Criar script FTP temporário
    const ftpScript = `
open ${host}
user ${user} ${pass}
binary
mkdir ${remoteDir}
cd ${remoteDir}
lcd ${localDir}
prompt off
mput *.*
quit
`;
    
    const ftpScriptPath = path.join(__dirname, 'temp_ftp_script.txt');
    fs.writeFileSync(ftpScriptPath, ftpScript);
    
    // Executar upload
    execSync(`ftp -n < "${ftpScriptPath}"`, { stdio: 'inherit' });
    
    // Limpar script temporário
    fs.unlinkSync(ftpScriptPath);
    
    logSuccess('Upload FTP concluído com sucesso!');
    return true;
  } catch (error) {
    logError(`Erro no upload FTP: ${error.message}`);
    return false;
  }
}

// Função principal
async function deployManual() {
  try {
    log(`${colors.bold}${colors.magenta}🚀 DEPLOY MANUAL RADREPORT PARA HOSTINGER${colors.reset}\n`);
    logInfo('Este script irá fazer deploy manual do RadReport para a Hostinger via FTP.');
    logWarning('Certifique-se de ter as credenciais FTP da Hostinger em mãos.\n');

    // 1. Obter informações do projeto
    logStep('1/7', 'Obtendo informações do projeto...');
    
    let gitHash, appVersion;
    try {
      gitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
      const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
      appVersion = packageJson.version || '1.0.0';
    } catch (error) {
      gitHash = 'unknown';
      appVersion = '1.0.0';
    }
    
    logSuccess(`Versão: ${appVersion}`);
    logSuccess(`Git Hash: ${gitHash}`);

    // 2. Confirmar deploy
    const confirmDeploy = await question('Deseja continuar com o deploy? (s/n): ');
    if (confirmDeploy.toLowerCase() !== 's' && confirmDeploy.toLowerCase() !== 'sim') {
      logInfo('Deploy cancelado pelo usuário.');
      rl.close();
      return;
    }

    // 3. Coletar credenciais FTP
    logStep('2/7', 'Configurando credenciais FTP...');
    
    logInfo('\n💡 Para encontrar suas credenciais FTP:');
    logInfo('1. Acesse: https://www.hostinger.com.br');
    logInfo('2. Vá para: Painel de Controle → Hospedagem');
    logInfo('3. Clique em: Gerenciar → Arquivos → Configurações FTP\n');
    
    const ftpHost = await question('Servidor FTP (ex: ftp.radreport.com.br): ');
    const ftpUser = await question('Usuário FTP: ');
    const ftpPass = await questionPassword('Senha FTP: ');
    
    if (!ftpHost || !ftpUser || !ftpPass) {
      logError('Todas as credenciais são obrigatórias!');
      rl.close();
      return;
    }

    // 4. Testar conexão FTP
    const ftpConnected = await testFTPConnection(ftpHost, ftpUser, ftpPass);
    if (!ftpConnected) {
      const retry = await question('Deseja tentar novamente? (s/n): ');
      if (retry.toLowerCase() === 's' || retry.toLowerCase() === 'sim') {
        return deployManual(); // Recursão para tentar novamente
      } else {
        logInfo('Deploy cancelado.');
        rl.close();
        return;
      }
    }

    // 5. Build do projeto
    logStep('3/7', 'Construindo projeto...');
    
    try {
      execSync('npm run build:hostinger', { 
        stdio: 'inherit',
        cwd: path.join(__dirname, '..')
      });
      logSuccess('Build concluído com sucesso!');
    } catch (error) {
      logError('Erro durante o build do projeto');
      throw error;
    }

    // 6. Preparar upload
    logStep('4/7', 'Preparando arquivos para upload...');
    
    const distPath = path.join(__dirname, '..', 'dist');
    if (!fs.existsSync(distPath)) {
      logError('Pasta dist não encontrada! Execute o build primeiro.');
      rl.close();
      return;
    }
    
    // Listar arquivos que serão enviados
    const files = fs.readdirSync(distPath);
    logInfo(`Arquivos a serem enviados (${files.length}):`);
    files.forEach(file => {
      const filePath = path.join(distPath, file);
      const stats = fs.statSync(filePath);
      const size = stats.isDirectory() ? 'DIR' : `${(stats.size / 1024).toFixed(1)} KB`;
      log(`  📄 ${file} (${size})`);
    });

    // 7. Confirmar upload
    const confirmUpload = await question('\nConfirmar upload destes arquivos? (s/n): ');
    if (confirmUpload.toLowerCase() !== 's' && confirmUpload.toLowerCase() !== 'sim') {
      logInfo('Upload cancelado pelo usuário.');
      rl.close();
      return;
    }

    // 8. Diretório remoto
    logStep('5/7', 'Configurando diretório remoto...');
    
    const remoteDir = await question('Diretório remoto (deixe vazio para /public_html/): ');
    const finalRemoteDir = remoteDir || '/public_html/';
    
    logInfo(`Upload será feito para: ${finalRemoteDir}`);

    // 9. Fazer upload
    const uploadSuccess = await uploadViaFTP(ftpHost, ftpUser, ftpPass, distPath, finalRemoteDir);
    
    if (!uploadSuccess) {
      logError('Falha no upload! Verifique as credenciais e conexão.');
      rl.close();
      return;
    }

    // 10. Verificação final
    logStep('7/7', 'Verificando deploy...');
    
    logSuccess('Deploy concluído com sucesso! 🎉');
    logInfo('\n📋 Resumo do deploy:');
    logInfo(`   🌐 Servidor: ${ftpHost}`);
    logInfo(`   📁 Diretório: ${finalRemoteDir}`);
    logInfo(`   🔢 Versão: ${appVersion}`);
    logInfo(`   🔤 Git Hash: ${gitHash}`);
    logInfo(`   ⏰ Timestamp: ${new Date().toISOString()}`);
    
    logInfo('\n🔗 URLs para verificar:');
    logInfo(`   Site: https://radreport.com.br`);
    logInfo(`   Versão: https://radreport.com.br/version.json`);
    logInfo(`   Health: https://radreport.com.br/health.json`);
    
    logWarning('\n⚠️ Importante:');
    logWarning('   - Verifique se o site está funcionando corretamente');
    logWarning('   - Teste as funcionalidades de login e navegação');
    logWarning('   - Confirme que todas as rotas da SPA estão funcionando');

  } catch (error) {
    logError(`Erro durante o deploy: ${error.message}`);
    console.error(error);
  } finally {
    rl.close();
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  deployManual().catch(error => {
    logError(`Erro fatal: ${error.message}`);
    process.exit(1);
  });
}

export { deployManual };