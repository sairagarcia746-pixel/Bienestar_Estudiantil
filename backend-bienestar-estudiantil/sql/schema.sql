CREATE TABLE IF NOT EXISTS usuario (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  correo VARCHAR(150) NOT NULL UNIQUE,
  contrasena VARCHAR(255) NOT NULL,
  fecha_nacimiento DATE,
  fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
  rol VARCHAR(20) NOT NULL DEFAULT 'estudiante'
);

CREATE TABLE IF NOT EXISTS registro_sueno (
  id_sueno INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  fecha DATE NOT NULL,
  hora_dormir TIME NOT NULL,
  hora_despertar TIME NOT NULL,
  horas_totales DECIMAL(4,2),
  calidad_sueno VARCHAR(20),
  FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
  INDEX idx_sueno_usuario_fecha (id_usuario, fecha)
);

CREATE TABLE IF NOT EXISTS registro_alimentacion (
  id_alimentacion INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  fecha DATE NOT NULL,
  tipo_comida VARCHAR(30) NOT NULL,
  descripcion VARCHAR(255),
  FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
  INDEX idx_alimentacion_usuario_fecha (id_usuario, fecha)
);

CREATE TABLE IF NOT EXISTS registro_hidratacion (
  id_hidratacion INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  fecha DATE NOT NULL,
  cantidad_ml INT NOT NULL,
  hora_registro TIME,
  FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
  INDEX idx_hidratacion_usuario_fecha (id_usuario, fecha)
);

CREATE TABLE IF NOT EXISTS registro_actividad_fisica (
  id_actividad INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  fecha DATE NOT NULL,
  tipo_actividad VARCHAR(50) NOT NULL,
  duracion_minutos INT,
  intensidad VARCHAR(20),
  FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
  INDEX idx_actividad_usuario_fecha (id_usuario, fecha)
);

CREATE TABLE IF NOT EXISTS registro_emocional (
  id_emocional INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  fecha DATE NOT NULL,
  estado_animo VARCHAR(30) NOT NULL,
  nivel_estres INT,
  notas VARCHAR(255),
  FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
  INDEX idx_emocional_usuario_fecha (id_usuario, fecha)
);
