


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE OR REPLACE FUNCTION "public"."cadastrar_matricula"("p_aluno_id" "uuid", "p_turma_id" "uuid") RETURNS "uuid"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
DECLARE
  v_aluno record;
  v_turma record;
  v_idade integer;
  v_quantidade integer;
  v_matricula_id uuid;
BEGIN
  -- Bloqueia a turma enquanto verifica a quantidade de vagas.
  SELECT *
  INTO v_turma
  FROM public.turmas
  WHERE id = p_turma_id
  FOR UPDATE;

  IF NOT FOUND OR v_turma.ativo = false THEN
    RAISE EXCEPTION 'Turma ativa não encontrada.';
  END IF;

  SELECT *
  INTO v_aluno
  FROM public.alunos
  WHERE id = p_aluno_id
  FOR UPDATE;

  IF NOT FOUND OR v_aluno.ativo = false THEN
    RAISE EXCEPTION 'Aluno ativo não encontrado.';
  END IF;

  -- Calcula a idade completa do aluno na data da matrícula.
  v_idade := EXTRACT(
    YEAR FROM age(current_date, v_aluno.data_nascimento)
  )::integer;

  IF v_idade NOT BETWEEN
    v_turma.idade_minima AND v_turma.idade_maxima
  THEN
    RAISE EXCEPTION
      'A idade do aluno não é compatível com a turma.';
  END IF;

  IF v_aluno.turno_escolar = v_turma.turno THEN
    RAISE EXCEPTION
      'O turno de treino deve ser oposto ao turno escolar.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.matriculas
    WHERE aluno_id = p_aluno_id
      AND ativo = true
  ) THEN
    RAISE EXCEPTION
      'O aluno já possui uma matrícula ativa.';
  END IF;

  SELECT count(*)
  INTO v_quantidade
  FROM public.matriculas
  WHERE turma_id = p_turma_id
    AND ativo = true;

  IF v_quantidade >= v_turma.capacidade_maxima THEN
    RAISE EXCEPTION 'A turma não possui vagas disponíveis.';
  END IF;

  INSERT INTO public.matriculas (
    aluno_id,
    turma_id
  )
  VALUES (
    p_aluno_id,
    p_turma_id
  )
  RETURNING id INTO v_matricula_id;

  RETURN v_matricula_id;
END;
$$;


ALTER FUNCTION "public"."cadastrar_matricula"("p_aluno_id" "uuid", "p_turma_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cadastrar_turma"("p_nome" "text", "p_idade_minima" integer, "p_idade_maxima" integer, "p_turno" "text", "p_hora_inicio" time without time zone, "p_hora_fim" time without time zone, "p_capacidade_maxima" integer, "p_dias_treino" integer[]) RETURNS "uuid"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
DECLARE
  v_turma_id uuid;
  v_dia integer;
BEGIN
  IF p_nome IS NULL OR btrim(p_nome) = '' THEN
    RAISE EXCEPTION 'Informe o nome da turma.';
  END IF;

  IF p_idade_minima IS NULL
     OR p_idade_maxima IS NULL
     OR p_idade_minima < 5
     OR p_idade_maxima > 15
     OR p_idade_minima > p_idade_maxima THEN
    RAISE EXCEPTION 'Informe uma faixa etária válida entre 5 e 15 anos.';
  END IF;

  IF p_dias_treino IS NULL
     OR cardinality(p_dias_treino) = 0
     OR EXISTS (
       SELECT 1
       FROM unnest(p_dias_treino) AS dia
       WHERE dia IS NULL OR dia NOT BETWEEN 1 AND 5
     )
     OR cardinality(p_dias_treino) <> (
       SELECT count(DISTINCT dia)
       FROM unnest(p_dias_treino) AS dia
     ) THEN
    RAISE EXCEPTION 'Selecione dias de treino válidos, sem repetições.';
  END IF;

  INSERT INTO public.turmas (
    nome,
    idade_minima,
    idade_maxima,
    turno,
    hora_inicio,
    hora_fim,
    capacidade_maxima
  )
  VALUES (
    btrim(p_nome),
    p_idade_minima,
    p_idade_maxima,
    p_turno,
    p_hora_inicio,
    p_hora_fim,
    p_capacidade_maxima
  )
  RETURNING id INTO v_turma_id;

  FOREACH v_dia IN ARRAY p_dias_treino LOOP
    INSERT INTO public.dias_treino (turma_id, dia_semana)
    VALUES (v_turma_id, v_dia);
  END LOOP;

  RETURN v_turma_id;
END;
$$;


ALTER FUNCTION "public"."cadastrar_turma"("p_nome" "text", "p_idade_minima" integer, "p_idade_maxima" integer, "p_turno" "text", "p_hora_inicio" time without time zone, "p_hora_fim" time without time zone, "p_capacidade_maxima" integer, "p_dias_treino" integer[]) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."definir_valor_mensalidade"("p_valor" numeric) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN

    IF p_valor IS NULL OR p_valor <= 0 THEN
        RAISE EXCEPTION
            'Informe um valor de mensalidade maior que zero.';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM public.usuarios
        WHERE id = auth.uid()
          AND perfil = 'gestor'
          AND ativo = true
    ) THEN
        RAISE EXCEPTION
            'Somente o gestor pode definir o valor da mensalidade.';
    END IF;

    INSERT INTO public.configuracoes (
        id,
        valor_mensalidade,
        alterado_por,
        alterado_em
    )
    VALUES (
        1,
        p_valor,
        auth.uid(),
        CURRENT_TIMESTAMP
    )
    ON CONFLICT (id)
    DO UPDATE SET
        valor_mensalidade = EXCLUDED.valor_mensalidade,
        alterado_por = EXCLUDED.alterado_por,
        alterado_em = EXCLUDED.alterado_em;

END;
$$;


ALTER FUNCTION "public"."definir_valor_mensalidade"("p_valor" numeric) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."editar_aluno_com_responsavel"("p_aluno_id" "uuid", "p_nome_aluno" "text", "p_data_nascimento" "date", "p_endereco" "text", "p_escola" "text", "p_turno_escolar" "text", "p_parentesco" "text", "p_responsavel_id" "uuid", "p_nome_responsavel" "text", "p_telefone_responsavel" "text") RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
begin
    -- Confirma que o aluno existe.
    if not exists (
        select 1
        from public.alunos
        where id = p_aluno_id
    ) then
        raise exception 'Aluno não encontrado.';
    end if;

    -- Confirma que o responsável selecionado existe.
    if not exists (
        select 1
        from public.responsaveis
        where id = p_responsavel_id
    ) then
        raise exception 'Responsável não encontrado.';
    end if;

    -- Atualiza os dados do responsável selecionado.
    update public.responsaveis
    set
        nome = trim(p_nome_responsavel),
        telefone = trim(p_telefone_responsavel)
    where id = p_responsavel_id;

    -- Atualiza o aluno e, se necessário, troca seu responsável.
    update public.alunos
    set
        nome = trim(p_nome_aluno),
        data_nascimento = p_data_nascimento,
        endereco = trim(p_endereco),
        escola = trim(p_escola),
        turno_escolar = p_turno_escolar,
        responsavel_id = p_responsavel_id,
        parentesco = trim(p_parentesco)
    where id = p_aluno_id;

    if not found then
        raise exception 'Não foi possível atualizar o aluno.';
    end if;
end;
$$;


ALTER FUNCTION "public"."editar_aluno_com_responsavel"("p_aluno_id" "uuid", "p_nome_aluno" "text", "p_data_nascimento" "date", "p_endereco" "text", "p_escola" "text", "p_turno_escolar" "text", "p_parentesco" "text", "p_responsavel_id" "uuid", "p_nome_responsavel" "text", "p_telefone_responsavel" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."editar_turma"("p_turma_id" "uuid", "p_nome" "text", "p_idade_minima" integer, "p_idade_maxima" integer, "p_turno" "text", "p_hora_inicio" time without time zone, "p_hora_fim" time without time zone, "p_capacidade_maxima" integer, "p_dias_treino" integer[]) RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
DECLARE
  v_quantidade_matriculas integer;
BEGIN
  IF p_nome IS NULL OR btrim(p_nome) = '' THEN
    RAISE EXCEPTION 'Informe o nome da turma.';
  END IF;

  IF p_idade_minima IS NULL
     OR p_idade_maxima IS NULL
     OR p_idade_minima < 5
     OR p_idade_maxima > 15
     OR p_idade_minima > p_idade_maxima THEN
    RAISE EXCEPTION
      'Informe uma faixa etária válida entre 5 e 15 anos.';
  END IF;

  IF p_dias_treino IS NULL
     OR cardinality(p_dias_treino) = 0
     OR EXISTS (
       SELECT 1
       FROM unnest(p_dias_treino) AS dia
       WHERE dia IS NULL OR dia NOT BETWEEN 1 AND 5
     )
     OR cardinality(p_dias_treino) <> (
       SELECT count(DISTINCT dia)
       FROM unnest(p_dias_treino) AS dia
     ) THEN
    RAISE EXCEPTION
      'Selecione dias de treino válidos, sem repetições.';
  END IF;

  -- Bloqueia a turma durante a verificação e a atualização.
  PERFORM 1
  FROM public.turmas
  WHERE id = p_turma_id
    AND ativo = true
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Turma ativa não encontrada.';
  END IF;

  SELECT count(*)
  INTO v_quantidade_matriculas
  FROM public.matriculas
  WHERE turma_id = p_turma_id
    AND ativo = true;

  IF p_capacidade_maxima < v_quantidade_matriculas THEN
    RAISE EXCEPTION
      'A capacidade não pode ser menor que a quantidade de alunos matriculados.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.matriculas AS m
    JOIN public.alunos AS a ON a.id = m.aluno_id
    WHERE m.turma_id = p_turma_id
      AND m.ativo = true
      AND (
        EXTRACT(YEAR FROM age(current_date, a.data_nascimento))::integer
          NOT BETWEEN p_idade_minima AND p_idade_maxima
        OR a.turno_escolar = p_turno
      )
  ) THEN
    RAISE EXCEPTION
      'A nova faixa etária ou turno é incompatível com alunos matriculados.';
  END IF;

  UPDATE public.turmas
  SET
    nome = btrim(p_nome),
    idade_minima = p_idade_minima,
    idade_maxima = p_idade_maxima,
    turno = p_turno,
    hora_inicio = p_hora_inicio,
    hora_fim = p_hora_fim,
    capacidade_maxima = p_capacidade_maxima
  WHERE id = p_turma_id;

  DELETE FROM public.dias_treino
  WHERE turma_id = p_turma_id;

  INSERT INTO public.dias_treino (turma_id, dia_semana)
  SELECT p_turma_id, dia
  FROM unnest(p_dias_treino) AS dia;
END;
$$;


ALTER FUNCTION "public"."editar_turma"("p_turma_id" "uuid", "p_nome" "text", "p_idade_minima" integer, "p_idade_maxima" integer, "p_turno" "text", "p_hora_inicio" time without time zone, "p_hora_fim" time without time zone, "p_capacidade_maxima" integer, "p_dias_treino" integer[]) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."encerrar_matricula"("p_matricula_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
BEGIN
  UPDATE public.matriculas
  SET
    ativo = false,
    data_encerramento = current_date
  WHERE id = p_matricula_id
    AND ativo = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Matrícula ativa não encontrada.';
  END IF;
END;
$$;


ALTER FUNCTION "public"."encerrar_matricula"("p_matricula_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."gerar_mensalidades"("p_mes_referencia" "date", "p_data_vencimento" "date") RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
DECLARE
  v_valor numeric(10, 2);
  v_inicio_mes date;
  v_inicio_mes_seguinte date;
  v_quantidade integer;
BEGIN
  -- Apenas o gestor pode gerar mensalidades.
  IF NOT EXISTS (
    SELECT 1
    FROM public.usuarios
    WHERE id = auth.uid()
      AND perfil = 'gestor'
      AND ativo = true
  ) THEN
    RAISE EXCEPTION
      'Somente o gestor pode gerar mensalidades.';
  END IF;

  IF p_mes_referencia IS NULL OR p_data_vencimento IS NULL THEN
    RAISE EXCEPTION
      'Informe o mês de referência e a data de vencimento.';
  END IF;

  IF EXTRACT(DAY FROM p_mes_referencia) <> 1 THEN
    RAISE EXCEPTION
      'O mês de referência deve ser informado com o primeiro dia do mês.';
  END IF;

  v_inicio_mes := p_mes_referencia;
  v_inicio_mes_seguinte := (v_inicio_mes + INTERVAL '1 month')::date;

  IF p_data_vencimento < v_inicio_mes
     OR p_data_vencimento >= v_inicio_mes_seguinte THEN
    RAISE EXCEPTION
      'A data de vencimento deve pertencer ao mês de referência.';
  END IF;

  -- Uma geração por vez, mesmo que dois gestores cliquem simultaneamente.
  PERFORM pg_advisory_xact_lock(2026, 1);

  SELECT valor_mensalidade
  INTO v_valor
  FROM public.configuracoes
  WHERE id = 1;

  IF v_valor IS NULL THEN
    RAISE EXCEPTION
      'Configure o valor da mensalidade antes de gerar as cobranças.';
  END IF;

  WITH matriculas_do_mes AS (
    SELECT
      m.id AS matricula_id,
      m.aluno_id,
      row_number() OVER (
        PARTITION BY m.aluno_id
        ORDER BY m.data_inicio ASC, m.id ASC
      ) AS posicao
    FROM public.matriculas AS m
    WHERE m.data_inicio < v_inicio_mes_seguinte
      AND (
        m.data_encerramento IS NULL
        OR m.data_encerramento >= v_inicio_mes
      )
  )
  INSERT INTO public.mensalidades (
    matricula_id,
    mes_referencia,
    valor,
    data_vencimento,
    situacao
  )
  SELECT
    m.matricula_id,
    v_inicio_mes,
    v_valor,
    p_data_vencimento,
    'pendente'
  FROM matriculas_do_mes AS m
  WHERE m.posicao = 1
    AND NOT EXISTS (
      SELECT 1
      FROM public.mensalidades AS mensalidade
      JOIN public.matriculas AS matricula_existente
        ON matricula_existente.id = mensalidade.matricula_id
      WHERE matricula_existente.aluno_id = m.aluno_id
        AND mensalidade.mes_referencia = v_inicio_mes
    )
  ON CONFLICT (matricula_id, mes_referencia) DO NOTHING;

  GET DIAGNOSTICS v_quantidade = ROW_COUNT;

  RETURN v_quantidade;
END;
$$;


ALTER FUNCTION "public"."gerar_mensalidades"("p_mes_referencia" "date", "p_data_vencimento" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."impedir_exclusao_matricula"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
BEGIN
  RAISE EXCEPTION
    'Matrículas não podem ser excluídas. Encerre a matrícula para preservar o histórico.';
END;
$$;


ALTER FUNCTION "public"."impedir_exclusao_matricula"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."impedir_mensalidade_duplicada_aluno"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
DECLARE
  v_aluno_id uuid;
BEGIN
  SELECT aluno_id
  INTO v_aluno_id
  FROM public.matriculas
  WHERE id = NEW.matricula_id;

  IF v_aluno_id IS NULL THEN
    RAISE EXCEPTION 'Matrícula não encontrada.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.mensalidades AS mensalidade
    JOIN public.matriculas AS matricula
      ON matricula.id = mensalidade.matricula_id
    WHERE matricula.aluno_id = v_aluno_id
      AND mensalidade.mes_referencia = NEW.mes_referencia
      AND mensalidade.id IS DISTINCT FROM NEW.id
  ) THEN
    RAISE EXCEPTION
      'O aluno já possui uma mensalidade para esse mês.';
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."impedir_mensalidade_duplicada_aluno"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."inativar_aluno"("p_aluno_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
BEGIN
  PERFORM 1
  FROM public.alunos
  WHERE id = p_aluno_id
    AND ativo = true
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Aluno ativo não encontrado.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.matriculas
    WHERE aluno_id = p_aluno_id
      AND ativo = true
  ) THEN
    RAISE EXCEPTION
      'Não é possível inativar um aluno com matrícula ativa.';
  END IF;

  UPDATE public.alunos
  SET ativo = false
  WHERE id = p_aluno_id;
END;
$$;


ALTER FUNCTION "public"."inativar_aluno"("p_aluno_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."inativar_responsavel"("p_responsavel_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
BEGIN
    IF NOT public.usuario_autorizado() THEN
        RAISE EXCEPTION 'Usuário não autorizado.';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM public.responsaveis
        WHERE id = p_responsavel_id
    ) THEN
        RAISE EXCEPTION 'Responsável não encontrado.';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM public.alunos
        WHERE responsavel_id = p_responsavel_id
          AND ativo = true
    ) THEN
        RAISE EXCEPTION
            'Não é possível inativar um responsável com alunos ativos vinculados.';
    END IF;

    UPDATE public.responsaveis
    SET ativo = false
    WHERE id = p_responsavel_id;
END;
$$;


ALTER FUNCTION "public"."inativar_responsavel"("p_responsavel_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."inativar_turma"("p_turma_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
BEGIN
  -- Bloqueia a turma durante a verificação e a atualização.
  PERFORM 1
  FROM public.turmas
  WHERE id = p_turma_id
    AND ativo = true
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Turma ativa não encontrada.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.matriculas
    WHERE turma_id = p_turma_id
      AND ativo = true
  ) THEN
    RAISE EXCEPTION
      'Não é possível inativar uma turma com matrículas ativas.';
  END IF;

  UPDATE public.turmas
  SET ativo = false
  WHERE id = p_turma_id;
END;
$$;


ALTER FUNCTION "public"."inativar_turma"("p_turma_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."registrar_data_consentimento"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
BEGIN
  IF NEW.consentimento_lgpd = true
     AND (
       TG_OP = 'INSERT'
       OR OLD.consentimento_lgpd = false
     ) THEN
    NEW.data_consentimento := CURRENT_TIMESTAMP;
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."registrar_data_consentimento"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."registrar_pagamento"("p_mensalidade_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
DECLARE
    v_situacao varchar(10);
BEGIN

    IF NOT public.usuario_autorizado() THEN
        RAISE EXCEPTION
            'Usuário não autorizado a registrar pagamentos.';
    END IF;

    IF p_mensalidade_id IS NULL THEN
        RAISE EXCEPTION 'Informe a mensalidade.';
    END IF;

    SELECT situacao
    INTO v_situacao
    FROM public.mensalidades
    WHERE id = p_mensalidade_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Mensalidade não encontrada.';
    END IF;

    IF v_situacao = 'paga' THEN
        RAISE EXCEPTION 'Esta mensalidade já está paga.';
    END IF;

    UPDATE public.mensalidades
    SET
        situacao = 'paga',
        data_pagamento = (
            CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'
        )::date,
        registrado_por = auth.uid()
    WHERE id = p_mensalidade_id;

END;
$$;


ALTER FUNCTION "public"."registrar_pagamento"("p_mensalidade_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."usuario_autorizado"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.usuarios
        WHERE id = (SELECT auth.uid())
          AND ativo = TRUE
    );
$$;


ALTER FUNCTION "public"."usuario_autorizado"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validar_alteracao_aluno"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
BEGIN
  -- Se o aluno não possui matrícula ativa, não há vínculo a verificar.
  IF NOT EXISTS (
    SELECT 1
    FROM public.matriculas
    WHERE aluno_id = NEW.id
      AND ativo = true
  ) THEN
    RETURN NEW;
  END IF;

  -- Um aluno matriculado não pode ser inativado.
  IF NEW.ativo IS DISTINCT FROM true THEN
    RAISE EXCEPTION
      'Não é possível inativar um aluno com matrícula ativa.';
  END IF;

  -- Verifica se os novos dados continuam compatíveis com a turma.
  IF EXISTS (
    SELECT 1
    FROM public.matriculas AS m
    JOIN public.turmas AS t ON t.id = m.turma_id
    WHERE m.aluno_id = NEW.id
      AND m.ativo = true
      AND (
        EXTRACT(
          YEAR FROM age(current_date, NEW.data_nascimento)
        )::integer NOT BETWEEN t.idade_minima AND t.idade_maxima
        OR NEW.turno_escolar = t.turno
      )
  ) THEN
    RAISE EXCEPTION
      'A nova idade ou turno escolar é incompatível com a matrícula ativa.';
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."validar_alteracao_aluno"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validar_alteracao_matricula"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
BEGIN
  -- Preserva a identidade e a data de início da matrícula.
  IF NEW.aluno_id IS DISTINCT FROM OLD.aluno_id
     OR NEW.turma_id IS DISTINCT FROM OLD.turma_id
     OR NEW.data_inicio IS DISTINCT FROM OLD.data_inicio THEN
    RAISE EXCEPTION
      'Não é permitido alterar o aluno, a turma ou a data de início de uma matrícula.';
  END IF;

  -- Uma matrícula encerrada permanece no histórico.
  IF OLD.ativo = false THEN
    IF NEW IS DISTINCT FROM OLD THEN
      RAISE EXCEPTION
        'Uma matrícula encerrada não pode ser alterada ou reativada.';
    END IF;

    RETURN NEW;
  END IF;

  -- Uma matrícula ativa só pode continuar ativa ou ser encerrada.
  IF NEW.ativo = true THEN
    IF NEW.data_encerramento IS NOT NULL THEN
      RAISE EXCEPTION
        'Uma matrícula ativa não pode ter data de encerramento.';
    END IF;

    RETURN NEW;
  END IF;

  -- Ao encerrar, a data deve ser registrada e não pode
  -- ser anterior à data de início.
  IF NEW.data_encerramento IS NULL
     OR NEW.data_encerramento < OLD.data_inicio THEN
    RAISE EXCEPTION
      'Informe uma data de encerramento válida.';
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."validar_alteracao_matricula"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validar_alteracao_turma"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
DECLARE
  v_quantidade_matriculas integer;
BEGIN
  -- Só precisamos verificar turmas que possuem matrículas ativas.
  SELECT count(*)
  INTO v_quantidade_matriculas
  FROM public.matriculas
  WHERE turma_id = NEW.id
    AND ativo = true;

  IF v_quantidade_matriculas = 0 THEN
    RETURN NEW;
  END IF;

  IF NEW.ativo IS DISTINCT FROM true THEN
    RAISE EXCEPTION
      'Não é possível inativar uma turma com matrículas ativas.';
  END IF;

  IF NEW.capacidade_maxima < v_quantidade_matriculas THEN
    RAISE EXCEPTION
      'A capacidade não pode ser menor que a quantidade de alunos matriculados.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.matriculas AS m
    JOIN public.alunos AS a ON a.id = m.aluno_id
    WHERE m.turma_id = NEW.id
      AND m.ativo = true
      AND (
        EXTRACT(
          YEAR FROM age(current_date, a.data_nascimento)
        )::integer NOT BETWEEN NEW.idade_minima AND NEW.idade_maxima
        OR a.turno_escolar = NEW.turno
      )
  ) THEN
    RAISE EXCEPTION
      'A nova faixa etária ou turno é incompatível com alunos matriculados.';
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."validar_alteracao_turma"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validar_idade_aluno"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
declare
  idade_atual integer;
begin
  if new.data_nascimento is null then
    raise exception 'A data de nascimento é obrigatória.';
  end if;

  if new.data_nascimento > current_date then
    raise exception 'A data de nascimento não pode ser futura.';
  end if;

  idade_atual := extract(
    year from age(current_date, new.data_nascimento)
  )::integer;

  if tg_op = 'INSERT' then
    if idade_atual < 5 or idade_atual > 15 then
      raise exception 'O aluno deve ter entre 5 e 15 anos completos.';
    end if;

  elsif tg_op = 'UPDATE'
    and new.data_nascimento is distinct from old.data_nascimento then

    if idade_atual < 5 or idade_atual > 15 then
      raise exception 'O aluno deve ter entre 5 e 15 anos completos.';
    end if;
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."validar_idade_aluno"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validar_nova_matricula"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
DECLARE
  v_aluno record;
  v_turma record;
  v_idade integer;
  v_quantidade integer;
BEGIN
  -- Esta etapa permite criar somente matrículas ativas.
  IF NEW.ativo IS DISTINCT FROM true
     OR NEW.data_encerramento IS NOT NULL THEN
    RAISE EXCEPTION
      'Uma nova matrícula deve começar ativa e sem data de encerramento.';
  END IF;

  -- Serializa os cadastros na mesma turma para proteger a capacidade.
  SELECT *
  INTO v_turma
  FROM public.turmas
  WHERE id = NEW.turma_id
  FOR UPDATE;

  IF NOT FOUND OR v_turma.ativo IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'Turma ativa não encontrada.';
  END IF;

  SELECT *
  INTO v_aluno
  FROM public.alunos
  WHERE id = NEW.aluno_id
  FOR UPDATE;

  IF NOT FOUND OR v_aluno.ativo IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'Aluno ativo não encontrado.';
  END IF;

  v_idade := EXTRACT(
    YEAR FROM age(current_date, v_aluno.data_nascimento)
  )::integer;

  IF v_idade NOT BETWEEN
    v_turma.idade_minima AND v_turma.idade_maxima THEN
    RAISE EXCEPTION
      'A idade do aluno não é compatível com a turma.';
  END IF;

  IF v_aluno.turno_escolar = v_turma.turno THEN
    RAISE EXCEPTION
      'O turno de treino deve ser oposto ao turno escolar.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.matriculas
    WHERE aluno_id = NEW.aluno_id
      AND ativo = true
  ) THEN
    RAISE EXCEPTION
      'O aluno já possui uma matrícula ativa.';
  END IF;

  SELECT count(*)
  INTO v_quantidade
  FROM public.matriculas
  WHERE turma_id = NEW.turma_id
    AND ativo = true;

  IF v_quantidade >= v_turma.capacidade_maxima THEN
    RAISE EXCEPTION 'A turma não possui vagas disponíveis.';
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."validar_nova_matricula"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validar_responsavel_ativo"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
BEGIN

    IF NOT EXISTS (
        SELECT 1
        FROM public.responsaveis
        WHERE id = NEW.responsavel_id
          AND ativo = true
    ) THEN
        RAISE EXCEPTION
            'O responsável selecionado não está ativo ou não existe.';
    END IF;

    RETURN NEW;

END;
$$;


ALTER FUNCTION "public"."validar_responsavel_ativo"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."alunos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "nome" character varying(100) NOT NULL,
    "data_nascimento" "date" NOT NULL,
    "endereco" "text" NOT NULL,
    "escola" character varying(100) NOT NULL,
    "turno_escolar" character varying(10) NOT NULL,
    "responsavel_id" "uuid" NOT NULL,
    "parentesco" character varying(30) NOT NULL,
    "ativo" boolean DEFAULT true NOT NULL,
    "criado_em" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "alunos_turno_escolar_check" CHECK ((("turno_escolar")::"text" = ANY ((ARRAY['manha'::character varying, 'tarde'::character varying])::"text"[])))
);


ALTER TABLE "public"."alunos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."configuracoes" (
    "id" integer DEFAULT 1 NOT NULL,
    "valor_mensalidade" numeric(10,2) NOT NULL,
    "alterado_por" "uuid",
    "alterado_em" timestamp with time zone,
    CONSTRAINT "configuracoes_id_check" CHECK (("id" = 1)),
    CONSTRAINT "configuracoes_valor_mensalidade_check" CHECK (("valor_mensalidade" > (0)::numeric))
);


ALTER TABLE "public"."configuracoes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."dias_treino" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "turma_id" "uuid" NOT NULL,
    "dia_semana" integer NOT NULL,
    CONSTRAINT "dias_treino_dia_semana_check" CHECK ((("dia_semana" >= 1) AND ("dia_semana" <= 5)))
);


ALTER TABLE "public"."dias_treino" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."matriculas" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "aluno_id" "uuid" NOT NULL,
    "turma_id" "uuid" NOT NULL,
    "data_inicio" "date" DEFAULT CURRENT_DATE NOT NULL,
    "data_encerramento" "date",
    "ativo" boolean DEFAULT true NOT NULL,
    CONSTRAINT "matricula_datas" CHECK ((("data_encerramento" IS NULL) OR ("data_encerramento" >= "data_inicio"))),
    CONSTRAINT "matricula_situacao" CHECK (((("ativo" = true) AND ("data_encerramento" IS NULL)) OR (("ativo" = false) AND ("data_encerramento" IS NOT NULL))))
);


ALTER TABLE "public"."matriculas" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mensalidades" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "matricula_id" "uuid" NOT NULL,
    "mes_referencia" "date" NOT NULL,
    "valor" numeric(10,2) NOT NULL,
    "data_vencimento" "date" NOT NULL,
    "data_pagamento" "date",
    "situacao" character varying(10) DEFAULT 'pendente'::character varying NOT NULL,
    "registrado_por" "uuid",
    CONSTRAINT "mensalidade_mes_referencia" CHECK ((EXTRACT(day FROM "mes_referencia") = (1)::numeric)),
    CONSTRAINT "mensalidade_pagamento" CHECK ((((("situacao")::"text" = 'pendente'::"text") AND ("data_pagamento" IS NULL)) OR ((("situacao")::"text" = 'paga'::"text") AND ("data_pagamento" IS NOT NULL)))),
    CONSTRAINT "mensalidades_situacao_check" CHECK ((("situacao")::"text" = ANY ((ARRAY['pendente'::character varying, 'paga'::character varying])::"text"[]))),
    CONSTRAINT "mensalidades_valor_check" CHECK (("valor" > (0)::numeric))
);


ALTER TABLE "public"."mensalidades" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."responsaveis" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "nome" character varying(100) NOT NULL,
    "telefone" character varying(20) NOT NULL,
    "consentimento_lgpd" boolean DEFAULT false NOT NULL,
    "data_consentimento" timestamp with time zone,
    "ativo" boolean DEFAULT true NOT NULL,
    CONSTRAINT "responsaveis_consentimento_consistente" CHECK (((("consentimento_lgpd" = false) AND ("data_consentimento" IS NULL)) OR (("consentimento_lgpd" = true) AND ("data_consentimento" IS NOT NULL))))
);


ALTER TABLE "public"."responsaveis" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."turmas" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "nome" character varying(100) NOT NULL,
    "idade_minima" integer NOT NULL,
    "idade_maxima" integer NOT NULL,
    "turno" character varying(10) NOT NULL,
    "hora_inicio" time without time zone NOT NULL,
    "hora_fim" time without time zone NOT NULL,
    "capacidade_maxima" integer DEFAULT 20 NOT NULL,
    "ativo" boolean DEFAULT true NOT NULL,
    CONSTRAINT "turma_capacidade" CHECK ((("capacidade_maxima" >= 1) AND ("capacidade_maxima" <= 20))),
    CONSTRAINT "turma_faixa_etaria" CHECK ((("idade_minima" >= 5) AND ("idade_maxima" <= 15) AND ("idade_minima" <= "idade_maxima"))),
    CONSTRAINT "turma_horario" CHECK (((("hora_inicio" = '08:00:00'::time without time zone) AND ("hora_fim" = '09:00:00'::time without time zone)) OR (("hora_inicio" = '09:00:00'::time without time zone) AND ("hora_fim" = '10:00:00'::time without time zone)) OR (("hora_inicio" = '10:00:00'::time without time zone) AND ("hora_fim" = '11:00:00'::time without time zone)) OR (("hora_inicio" = '14:00:00'::time without time zone) AND ("hora_fim" = '15:00:00'::time without time zone)) OR (("hora_inicio" = '15:00:00'::time without time zone) AND ("hora_fim" = '16:00:00'::time without time zone)) OR (("hora_inicio" = '16:00:00'::time without time zone) AND ("hora_fim" = '17:00:00'::time without time zone)))),
    CONSTRAINT "turma_turno_horario" CHECK ((((("turno")::"text" = 'manha'::"text") AND ("hora_inicio" < '12:00:00'::time without time zone)) OR ((("turno")::"text" = 'tarde'::"text") AND ("hora_inicio" >= '12:00:00'::time without time zone)))),
    CONSTRAINT "turmas_turno_check" CHECK ((("turno")::"text" = ANY ((ARRAY['manha'::character varying, 'tarde'::character varying])::"text"[])))
);


ALTER TABLE "public"."turmas" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."usuarios" (
    "id" "uuid" NOT NULL,
    "nome" character varying(100) NOT NULL,
    "perfil" character varying(20) DEFAULT 'gestor'::character varying NOT NULL,
    "ativo" boolean DEFAULT true NOT NULL,
    CONSTRAINT "usuarios_perfil_check" CHECK ((("perfil")::"text" = ANY ((ARRAY['gestor'::character varying, 'administrativo'::character varying])::"text"[])))
);


ALTER TABLE "public"."usuarios" OWNER TO "postgres";


ALTER TABLE ONLY "public"."alunos"
    ADD CONSTRAINT "alunos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."configuracoes"
    ADD CONSTRAINT "configuracoes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."dias_treino"
    ADD CONSTRAINT "dia_unico_por_turma" UNIQUE ("turma_id", "dia_semana");



ALTER TABLE ONLY "public"."dias_treino"
    ADD CONSTRAINT "dias_treino_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."matriculas"
    ADD CONSTRAINT "matriculas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mensalidades"
    ADD CONSTRAINT "mensalidade_unica" UNIQUE ("matricula_id", "mes_referencia");



ALTER TABLE ONLY "public"."mensalidades"
    ADD CONSTRAINT "mensalidades_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."responsaveis"
    ADD CONSTRAINT "responsaveis_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."turmas"
    ADD CONSTRAINT "turmas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."usuarios"
    ADD CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id");



CREATE UNIQUE INDEX "uma_matricula_ativa_por_aluno" ON "public"."matriculas" USING "btree" ("aluno_id") WHERE ("ativo" = true);



CREATE OR REPLACE TRIGGER "trg_impedir_exclusao_matricula" BEFORE DELETE ON "public"."matriculas" FOR EACH ROW EXECUTE FUNCTION "public"."impedir_exclusao_matricula"();



CREATE OR REPLACE TRIGGER "trg_impedir_mensalidade_duplicada_aluno" BEFORE INSERT OR UPDATE OF "matricula_id", "mes_referencia" ON "public"."mensalidades" FOR EACH ROW EXECUTE FUNCTION "public"."impedir_mensalidade_duplicada_aluno"();



CREATE OR REPLACE TRIGGER "trg_registrar_data_consentimento" BEFORE INSERT OR UPDATE OF "consentimento_lgpd" ON "public"."responsaveis" FOR EACH ROW EXECUTE FUNCTION "public"."registrar_data_consentimento"();



CREATE OR REPLACE TRIGGER "trg_validar_alteracao_aluno" BEFORE UPDATE OF "data_nascimento", "turno_escolar", "ativo" ON "public"."alunos" FOR EACH ROW EXECUTE FUNCTION "public"."validar_alteracao_aluno"();



CREATE OR REPLACE TRIGGER "trg_validar_alteracao_matricula" BEFORE UPDATE ON "public"."matriculas" FOR EACH ROW EXECUTE FUNCTION "public"."validar_alteracao_matricula"();



CREATE OR REPLACE TRIGGER "trg_validar_alteracao_turma" BEFORE UPDATE ON "public"."turmas" FOR EACH ROW EXECUTE FUNCTION "public"."validar_alteracao_turma"();



CREATE OR REPLACE TRIGGER "trg_validar_nova_matricula" BEFORE INSERT ON "public"."matriculas" FOR EACH ROW EXECUTE FUNCTION "public"."validar_nova_matricula"();



CREATE OR REPLACE TRIGGER "trg_validar_responsavel_ativo" BEFORE INSERT OR UPDATE OF "responsavel_id" ON "public"."alunos" FOR EACH ROW EXECUTE FUNCTION "public"."validar_responsavel_ativo"();



CREATE OR REPLACE TRIGGER "validar_idade_aluno_trigger" BEFORE INSERT OR UPDATE OF "data_nascimento" ON "public"."alunos" FOR EACH ROW EXECUTE FUNCTION "public"."validar_idade_aluno"();



ALTER TABLE ONLY "public"."alunos"
    ADD CONSTRAINT "alunos_responsavel_id_fkey" FOREIGN KEY ("responsavel_id") REFERENCES "public"."responsaveis"("id");



ALTER TABLE ONLY "public"."configuracoes"
    ADD CONSTRAINT "configuracoes_alterado_por_fkey" FOREIGN KEY ("alterado_por") REFERENCES "public"."usuarios"("id");



ALTER TABLE ONLY "public"."dias_treino"
    ADD CONSTRAINT "dias_treino_turma_id_fkey" FOREIGN KEY ("turma_id") REFERENCES "public"."turmas"("id");



ALTER TABLE ONLY "public"."matriculas"
    ADD CONSTRAINT "matriculas_aluno_id_fkey" FOREIGN KEY ("aluno_id") REFERENCES "public"."alunos"("id");



ALTER TABLE ONLY "public"."matriculas"
    ADD CONSTRAINT "matriculas_turma_id_fkey" FOREIGN KEY ("turma_id") REFERENCES "public"."turmas"("id");



ALTER TABLE ONLY "public"."mensalidades"
    ADD CONSTRAINT "mensalidades_matricula_id_fkey" FOREIGN KEY ("matricula_id") REFERENCES "public"."matriculas"("id");



ALTER TABLE ONLY "public"."mensalidades"
    ADD CONSTRAINT "mensalidades_registrado_por_fkey" FOREIGN KEY ("registrado_por") REFERENCES "public"."usuarios"("id");



ALTER TABLE ONLY "public"."usuarios"
    ADD CONSTRAINT "usuarios_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Acesso aos alunos" ON "public"."alunos" TO "authenticated" USING ("public"."usuario_autorizado"()) WITH CHECK ("public"."usuario_autorizado"());



CREATE POLICY "Acesso aos dias de treino" ON "public"."dias_treino" TO "authenticated" USING ("public"."usuario_autorizado"()) WITH CHECK ("public"."usuario_autorizado"());



CREATE POLICY "Acesso aos responsaveis" ON "public"."responsaveis" TO "authenticated" USING ("public"."usuario_autorizado"()) WITH CHECK ("public"."usuario_autorizado"());



CREATE POLICY "Acesso as matriculas" ON "public"."matriculas" TO "authenticated" USING ("public"."usuario_autorizado"()) WITH CHECK ("public"."usuario_autorizado"());



CREATE POLICY "Acesso as mensalidades" ON "public"."mensalidades" TO "authenticated" USING ("public"."usuario_autorizado"()) WITH CHECK ("public"."usuario_autorizado"());



CREATE POLICY "Acesso as turmas" ON "public"."turmas" TO "authenticated" USING ("public"."usuario_autorizado"()) WITH CHECK ("public"."usuario_autorizado"());



CREATE POLICY "Consultar configuracoes" ON "public"."configuracoes" FOR SELECT TO "authenticated" USING ("public"."usuario_autorizado"());



CREATE POLICY "Consultar proprio usuario" ON "public"."usuarios" FOR SELECT TO "authenticated" USING (("id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Gestor altera configuracoes" ON "public"."configuracoes" TO "authenticated" USING (("public"."usuario_autorizado"() AND (EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = ( SELECT "auth"."uid"() AS "uid")) AND (("usuarios"."perfil")::"text" = 'gestor'::"text") AND ("usuarios"."ativo" = true)))))) WITH CHECK (("public"."usuario_autorizado"() AND (EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = ( SELECT "auth"."uid"() AS "uid")) AND (("usuarios"."perfil")::"text" = 'gestor'::"text") AND ("usuarios"."ativo" = true))))));



ALTER TABLE "public"."alunos" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."configuracoes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."dias_treino" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."matriculas" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."mensalidades" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."responsaveis" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."turmas" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."usuarios" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."cadastrar_matricula"("p_aluno_id" "uuid", "p_turma_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."cadastrar_matricula"("p_aluno_id" "uuid", "p_turma_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."cadastrar_matricula"("p_aluno_id" "uuid", "p_turma_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."cadastrar_turma"("p_nome" "text", "p_idade_minima" integer, "p_idade_maxima" integer, "p_turno" "text", "p_hora_inicio" time without time zone, "p_hora_fim" time without time zone, "p_capacidade_maxima" integer, "p_dias_treino" integer[]) TO "anon";
GRANT ALL ON FUNCTION "public"."cadastrar_turma"("p_nome" "text", "p_idade_minima" integer, "p_idade_maxima" integer, "p_turno" "text", "p_hora_inicio" time without time zone, "p_hora_fim" time without time zone, "p_capacidade_maxima" integer, "p_dias_treino" integer[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."cadastrar_turma"("p_nome" "text", "p_idade_minima" integer, "p_idade_maxima" integer, "p_turno" "text", "p_hora_inicio" time without time zone, "p_hora_fim" time without time zone, "p_capacidade_maxima" integer, "p_dias_treino" integer[]) TO "service_role";



REVOKE ALL ON FUNCTION "public"."definir_valor_mensalidade"("p_valor" numeric) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."definir_valor_mensalidade"("p_valor" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."definir_valor_mensalidade"("p_valor" numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."editar_aluno_com_responsavel"("p_aluno_id" "uuid", "p_nome_aluno" "text", "p_data_nascimento" "date", "p_endereco" "text", "p_escola" "text", "p_turno_escolar" "text", "p_parentesco" "text", "p_responsavel_id" "uuid", "p_nome_responsavel" "text", "p_telefone_responsavel" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."editar_aluno_com_responsavel"("p_aluno_id" "uuid", "p_nome_aluno" "text", "p_data_nascimento" "date", "p_endereco" "text", "p_escola" "text", "p_turno_escolar" "text", "p_parentesco" "text", "p_responsavel_id" "uuid", "p_nome_responsavel" "text", "p_telefone_responsavel" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."editar_aluno_com_responsavel"("p_aluno_id" "uuid", "p_nome_aluno" "text", "p_data_nascimento" "date", "p_endereco" "text", "p_escola" "text", "p_turno_escolar" "text", "p_parentesco" "text", "p_responsavel_id" "uuid", "p_nome_responsavel" "text", "p_telefone_responsavel" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."editar_turma"("p_turma_id" "uuid", "p_nome" "text", "p_idade_minima" integer, "p_idade_maxima" integer, "p_turno" "text", "p_hora_inicio" time without time zone, "p_hora_fim" time without time zone, "p_capacidade_maxima" integer, "p_dias_treino" integer[]) TO "anon";
GRANT ALL ON FUNCTION "public"."editar_turma"("p_turma_id" "uuid", "p_nome" "text", "p_idade_minima" integer, "p_idade_maxima" integer, "p_turno" "text", "p_hora_inicio" time without time zone, "p_hora_fim" time without time zone, "p_capacidade_maxima" integer, "p_dias_treino" integer[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."editar_turma"("p_turma_id" "uuid", "p_nome" "text", "p_idade_minima" integer, "p_idade_maxima" integer, "p_turno" "text", "p_hora_inicio" time without time zone, "p_hora_fim" time without time zone, "p_capacidade_maxima" integer, "p_dias_treino" integer[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."encerrar_matricula"("p_matricula_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."encerrar_matricula"("p_matricula_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."encerrar_matricula"("p_matricula_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."gerar_mensalidades"("p_mes_referencia" "date", "p_data_vencimento" "date") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."gerar_mensalidades"("p_mes_referencia" "date", "p_data_vencimento" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gerar_mensalidades"("p_mes_referencia" "date", "p_data_vencimento" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."impedir_exclusao_matricula"() TO "anon";
GRANT ALL ON FUNCTION "public"."impedir_exclusao_matricula"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."impedir_exclusao_matricula"() TO "service_role";



GRANT ALL ON FUNCTION "public"."impedir_mensalidade_duplicada_aluno"() TO "anon";
GRANT ALL ON FUNCTION "public"."impedir_mensalidade_duplicada_aluno"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."impedir_mensalidade_duplicada_aluno"() TO "service_role";



GRANT ALL ON FUNCTION "public"."inativar_aluno"("p_aluno_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."inativar_aluno"("p_aluno_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."inativar_aluno"("p_aluno_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."inativar_responsavel"("p_responsavel_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."inativar_responsavel"("p_responsavel_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."inativar_responsavel"("p_responsavel_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."inativar_turma"("p_turma_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."inativar_turma"("p_turma_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."inativar_turma"("p_turma_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."registrar_data_consentimento"() TO "anon";
GRANT ALL ON FUNCTION "public"."registrar_data_consentimento"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."registrar_data_consentimento"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."registrar_pagamento"("p_mensalidade_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."registrar_pagamento"("p_mensalidade_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."registrar_pagamento"("p_mensalidade_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."usuario_autorizado"() TO "anon";
GRANT ALL ON FUNCTION "public"."usuario_autorizado"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."usuario_autorizado"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validar_alteracao_aluno"() TO "anon";
GRANT ALL ON FUNCTION "public"."validar_alteracao_aluno"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validar_alteracao_aluno"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validar_alteracao_matricula"() TO "anon";
GRANT ALL ON FUNCTION "public"."validar_alteracao_matricula"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validar_alteracao_matricula"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validar_alteracao_turma"() TO "anon";
GRANT ALL ON FUNCTION "public"."validar_alteracao_turma"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validar_alteracao_turma"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validar_idade_aluno"() TO "anon";
GRANT ALL ON FUNCTION "public"."validar_idade_aluno"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validar_idade_aluno"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validar_nova_matricula"() TO "anon";
GRANT ALL ON FUNCTION "public"."validar_nova_matricula"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validar_nova_matricula"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validar_responsavel_ativo"() TO "anon";
GRANT ALL ON FUNCTION "public"."validar_responsavel_ativo"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validar_responsavel_ativo"() TO "service_role";



GRANT SELECT,INSERT,MAINTAIN,UPDATE ON TABLE "public"."alunos" TO "authenticated";
GRANT ALL ON TABLE "public"."alunos" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."configuracoes" TO "authenticated";
GRANT ALL ON TABLE "public"."configuracoes" TO "service_role";



GRANT SELECT,INSERT,DELETE,MAINTAIN,UPDATE ON TABLE "public"."dias_treino" TO "authenticated";
GRANT ALL ON TABLE "public"."dias_treino" TO "service_role";



GRANT SELECT,INSERT,MAINTAIN,UPDATE ON TABLE "public"."matriculas" TO "authenticated";
GRANT ALL ON TABLE "public"."matriculas" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."mensalidades" TO "authenticated";
GRANT ALL ON TABLE "public"."mensalidades" TO "service_role";



GRANT SELECT,INSERT,MAINTAIN,UPDATE ON TABLE "public"."responsaveis" TO "authenticated";
GRANT ALL ON TABLE "public"."responsaveis" TO "service_role";



GRANT SELECT,INSERT,MAINTAIN,UPDATE ON TABLE "public"."turmas" TO "authenticated";
GRANT ALL ON TABLE "public"."turmas" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."usuarios" TO "authenticated";
GRANT ALL ON TABLE "public"."usuarios" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







