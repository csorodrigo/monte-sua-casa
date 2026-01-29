'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  DadosSimulacao,
  Comodo,
  Estado,
  TipoTelhado,
  TipoTijolo,
  PadraoAcabamento,
  ResultadoOrcamento,
} from '@/types';
import { RelatorioCompleto } from '@/types/relatorios';
import { comodosPadrao, gerarIdComodo } from '@/lib/calculations';

interface DadosIniciais {
  estados: Estado[];
  tiposTelhado: TipoTelhado[];
  tiposTijolo: TipoTijolo[];
  padroesAcabamento: PadraoAcabamento[];
}

interface UseSimulacaoReturn {
  // Dados
  dados: DadosSimulacao;
  dadosIniciais: DadosIniciais | null;
  resultado: ResultadoOrcamento | null;
  relatorioDetalhado: RelatorioCompleto | null;
  carregando: boolean;
  carregandoRelatorio: boolean;
  erro: string | null;

  // Acoes - Estado
  setEstado: (estadoId: number) => void;

  // Acoes - Tipos
  setTipoTelhado: (id: number) => void;
  setTipoTijolo: (id: number) => void;
  setPadraoAcabamento: (id: number) => void;

  // Acoes - Reboco
  setRebocoExterno: (valor: boolean) => void;
  setRebocoInterno: (valor: boolean) => void;

  // Acoes - Comodos
  adicionarComodo: () => void;
  removerComodo: (id: string) => void;
  atualizarComodo: (id: string, campo: keyof Comodo, valor: string | number) => void;

  // Acoes - Muro
  setIncluirMuro: (valor: boolean) => void;
  setMuroFrente: (valor: number) => void;
  setMuroFundo: (valor: number) => void;
  setMuroDireita: (valor: number) => void;
  setMuroEsquerda: (valor: number) => void;
  setMuroAltura: (valor: number) => void;

  // Acoes - Piscina
  setIncluirPiscina: (valor: boolean) => void;
  setPiscinaLargura: (valor: number) => void;
  setPiscinaComprimento: (valor: number) => void;
  setPiscinaProfundidade: (valor: number) => void;

  // Acoes - Churrasqueira
  setIncluirChurrasqueira: (valor: boolean) => void;

  // Acoes - Calculo
  calcular: () => Promise<void>;
  calcularRelatorioDetalhado: () => Promise<void>;
  salvar: () => Promise<number | null>;
  limpar: () => void;
}

const dadosIniciaisVazios: DadosSimulacao = {
  estadoId: 0,
  tipoTelhadoId: 0,
  tipoTijoloId: 0,
  padraoAcabamentoId: 0,
  reboco: { externo: true, interno: true },
  comodos: comodosPadrao(),
  muro: {
    incluir: false,
    frente: 10,
    fundo: 10,
    direita: 20,
    esquerda: 20,
    altura: 2.5,
  },
  piscina: {
    incluir: false,
    largura: 4,
    comprimento: 8,
    profundidade: 1.5,
  },
  incluirChurrasqueira: false,
};

export function useSimulacao(): UseSimulacaoReturn {
  const [dados, setDados] = useState<DadosSimulacao>(dadosIniciaisVazios);
  const [dadosIniciais, setDadosIniciais] = useState<DadosIniciais | null>(null);
  const [resultado, setResultado] = useState<ResultadoOrcamento | null>(null);
  const [relatorioDetalhado, setRelatorioDetalhado] = useState<RelatorioCompleto | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [carregandoRelatorio, setCarregandoRelatorio] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Carregar dados iniciais
  useEffect(() => {
    async function carregarDados() {
      try {
        const [estadosRes, tiposRes] = await Promise.all([
          fetch('/api/estados'),
          fetch('/api/tipos'),
        ]);

        const estadosData = await estadosRes.json();
        const tiposData = await tiposRes.json();

        if (estadosData.success && tiposData.success) {
          const dados: DadosIniciais = {
            estados: estadosData.data,
            tiposTelhado: tiposData.data.tiposTelhado,
            tiposTijolo: tiposData.data.tiposTijolo,
            padroesAcabamento: tiposData.data.padroesAcabamento,
          };
          setDadosIniciais(dados);

          // Definir valores padrao
          if (dados.estados.length > 0) {
            const sp = dados.estados.find(e => e.sigla === 'SP');
            setDados(prev => ({
              ...prev,
              estadoId: sp?.id || dados.estados[0].id,
              tipoTelhadoId: dados.tiposTelhado[0]?.id || 0,
              tipoTijoloId: dados.tiposTijolo[0]?.id || 0,
              padraoAcabamentoId: dados.padroesAcabamento[1]?.id || dados.padroesAcabamento[0]?.id || 0,
            }));
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
        setErro('Erro ao carregar dados');
      }
    }

    carregarDados();
  }, []);

  // Acoes - Estado
  const setEstado = useCallback((estadoId: number) => {
    setDados(prev => ({ ...prev, estadoId }));
    setResultado(null);
  }, []);

  // Acoes - Tipos
  const setTipoTelhado = useCallback((id: number) => {
    setDados(prev => ({ ...prev, tipoTelhadoId: id }));
    setResultado(null);
  }, []);

  const setTipoTijolo = useCallback((id: number) => {
    setDados(prev => ({ ...prev, tipoTijoloId: id }));
    setResultado(null);
  }, []);

  const setPadraoAcabamento = useCallback((id: number) => {
    setDados(prev => ({ ...prev, padraoAcabamentoId: id }));
    setResultado(null);
  }, []);

  // Acoes - Reboco
  const setRebocoExterno = useCallback((valor: boolean) => {
    setDados(prev => ({
      ...prev,
      reboco: { ...prev.reboco, externo: valor },
    }));
    setResultado(null);
  }, []);

  const setRebocoInterno = useCallback((valor: boolean) => {
    setDados(prev => ({
      ...prev,
      reboco: { ...prev.reboco, interno: valor },
    }));
    setResultado(null);
  }, []);

  // Acoes - Comodos
  const adicionarComodo = useCallback(() => {
    setDados(prev => ({
      ...prev,
      comodos: [
        ...prev.comodos,
        {
          id: gerarIdComodo(),
          nome: `Comodo ${prev.comodos.length + 1}`,
          largura: 3,
          comprimento: 4,
          peDireito: 2.8,
        },
      ],
    }));
    setResultado(null);
  }, []);

  const removerComodo = useCallback((id: string) => {
    setDados(prev => ({
      ...prev,
      comodos: prev.comodos.filter(c => c.id !== id),
    }));
    setResultado(null);
  }, []);

  const atualizarComodo = useCallback(
    (id: string, campo: keyof Comodo, valor: string | number) => {
      setDados(prev => ({
        ...prev,
        comodos: prev.comodos.map(c =>
          c.id === id ? { ...c, [campo]: valor } : c
        ),
      }));
      setResultado(null);
    },
    []
  );

  // Acoes - Muro
  const setIncluirMuro = useCallback((valor: boolean) => {
    setDados(prev => ({
      ...prev,
      muro: { ...prev.muro, incluir: valor },
    }));
    setResultado(null);
  }, []);

  const setMuroFrente = useCallback((valor: number) => {
    setDados(prev => ({
      ...prev,
      muro: { ...prev.muro, frente: valor },
    }));
    setResultado(null);
  }, []);

  const setMuroFundo = useCallback((valor: number) => {
    setDados(prev => ({
      ...prev,
      muro: { ...prev.muro, fundo: valor },
    }));
    setResultado(null);
  }, []);

  const setMuroDireita = useCallback((valor: number) => {
    setDados(prev => ({
      ...prev,
      muro: { ...prev.muro, direita: valor },
    }));
    setResultado(null);
  }, []);

  const setMuroEsquerda = useCallback((valor: number) => {
    setDados(prev => ({
      ...prev,
      muro: { ...prev.muro, esquerda: valor },
    }));
    setResultado(null);
  }, []);

  const setMuroAltura = useCallback((valor: number) => {
    setDados(prev => ({
      ...prev,
      muro: { ...prev.muro, altura: valor },
    }));
    setResultado(null);
  }, []);

  // Acoes - Piscina
  const setIncluirPiscina = useCallback((valor: boolean) => {
    setDados(prev => ({
      ...prev,
      piscina: { ...prev.piscina, incluir: valor },
    }));
    setResultado(null);
  }, []);

  const setPiscinaLargura = useCallback((valor: number) => {
    setDados(prev => ({
      ...prev,
      piscina: { ...prev.piscina, largura: valor },
    }));
    setResultado(null);
  }, []);

  const setPiscinaComprimento = useCallback((valor: number) => {
    setDados(prev => ({
      ...prev,
      piscina: { ...prev.piscina, comprimento: valor },
    }));
    setResultado(null);
  }, []);

  const setPiscinaProfundidade = useCallback((valor: number) => {
    setDados(prev => ({
      ...prev,
      piscina: { ...prev.piscina, profundidade: valor },
    }));
    setResultado(null);
  }, []);

  // Acoes - Churrasqueira
  const setIncluirChurrasqueira = useCallback((valor: boolean) => {
    setDados(prev => ({
      ...prev,
      incluirChurrasqueira: valor,
    }));
    setResultado(null);
  }, []);

  // Calcular orcamento e relatorio detalhado automaticamente
  const calcular = useCallback(async () => {
    setCarregando(true);
    setErro(null);

    try {
      // Primeiro calcula o orcamento basico
      const response = await fetch('/api/calcular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      });

      const result = await response.json();

      if (result.success) {
        setResultado(result.data);

        // Gera automaticamente o relatorio detalhado
        setCarregandoRelatorio(true);
        try {
          const relatorioResponse = await fetch('/api/relatorio-completo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados),
          });

          const relatorioResult = await relatorioResponse.json();

          if (relatorioResult.success) {
            setRelatorioDetalhado(relatorioResult.data);
          } else {
            console.error('Erro ao gerar relatorio:', relatorioResult.error);
          }
        } catch (relatorioError) {
          console.error('Erro ao gerar relatorio detalhado:', relatorioError);
        } finally {
          setCarregandoRelatorio(false);
        }
      } else {
        setErro(result.error || 'Erro ao calcular');
      }
    } catch (error) {
      console.error('Erro ao calcular:', error);
      setErro('Erro de conexao');
    } finally {
      setCarregando(false);
    }
  }, [dados]);

  // Calcular relatorio detalhado
  const calcularRelatorioDetalhado = useCallback(async () => {
    setCarregandoRelatorio(true);
    setErro(null);

    try {
      const response = await fetch('/api/relatorio-completo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      });

      const result = await response.json();

      if (result.success) {
        setRelatorioDetalhado(result.data);
      } else {
        setErro(result.error || 'Erro ao gerar relatorio detalhado');
      }
    } catch (error) {
      console.error('Erro ao gerar relatorio detalhado:', error);
      setErro('Erro de conexao');
    } finally {
      setCarregandoRelatorio(false);
    }
  }, [dados]);

  // Salvar simulacao
  const salvar = useCallback(async (): Promise<number | null> => {
    setCarregando(true);
    setErro(null);

    try {
      const response = await fetch('/api/simulacao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      });

      const result = await response.json();

      if (result.success) {
        setResultado(result.data.resultado);
        return result.data.simulacaoId;
      } else {
        setErro(result.error || 'Erro ao salvar');
        return null;
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setErro('Erro de conexao');
      return null;
    } finally {
      setCarregando(false);
    }
  }, [dados]);

  // Limpar
  const limpar = useCallback(() => {
    setDados({
      ...dadosIniciaisVazios,
      estadoId: dados.estadoId,
      tipoTelhadoId: dados.tipoTelhadoId,
      tipoTijoloId: dados.tipoTijoloId,
      padraoAcabamentoId: dados.padraoAcabamentoId,
      comodos: comodosPadrao(),
    });
    setResultado(null);
    setRelatorioDetalhado(null);
    setErro(null);
  }, [dados.estadoId, dados.tipoTelhadoId, dados.tipoTijoloId, dados.padraoAcabamentoId]);

  return {
    dados,
    dadosIniciais,
    resultado,
    relatorioDetalhado,
    carregando,
    carregandoRelatorio,
    erro,
    setEstado,
    setTipoTelhado,
    setTipoTijolo,
    setPadraoAcabamento,
    setRebocoExterno,
    setRebocoInterno,
    adicionarComodo,
    removerComodo,
    atualizarComodo,
    setIncluirMuro,
    setMuroFrente,
    setMuroFundo,
    setMuroDireita,
    setMuroEsquerda,
    setMuroAltura,
    setIncluirPiscina,
    setPiscinaLargura,
    setPiscinaComprimento,
    setPiscinaProfundidade,
    setIncluirChurrasqueira,
    calcular,
    calcularRelatorioDetalhado,
    salvar,
    limpar,
  };
}
