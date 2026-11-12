package com.linklab.repository;

import com.linklab.model.Simulacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SimulacionRepository extends JpaRepository<Simulacion, Long> {

    long countByUsuario(String usuario);

    @Query("select count(distinct s.escenarioId) from Simulacion s where s.usuario = :u")
    long contarEscenariosDistintos(@Param("u") String usuario);

    @Query("select avg(s.probabilidadPerdida) from Simulacion s where s.usuario = :u")
    Double perdidaPromedio(@Param("u") String usuario);

    List<Simulacion> findTop5ByUsuarioOrderByCreadaEnDesc(String usuario);
}