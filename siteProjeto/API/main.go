package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	_ "github.com/go-sql-driver/mysql"
	"github.com/rs/cors"
)

type RespostaAutenticacao struct {
	Token string `json:"token"`
}

var db *sql.DB

func initDB() {
	var err error
	dataSourceName := "root:@tcp(127.0.0.1:3306)/site_usuario?parseTime=true"

	db, err = sql.Open("mysql", dataSourceName)
	if err != nil {
		log.Fatalf("Erro ao configurar o pool do MySQL: %v", err)
	}

	if err = db.Ping(); err != nil {
		log.Fatalf("Erro: Banco de dados inacessível! %v", err)
	}
	fmt.Println("Conexão com o MySQL estabelecida")
}

func main() {
	initDB()
	defer db.Close()

	mux := http.NewServeMux()

	// Rota que o seu main.js vai chamar ao clicar em "Acessar"
	mux.HandleFunc("/api/login", loginHandler)

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"POST", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	})

	handler := c.Handler(mux)

	fmt.Println("Servidor Go na porta 8080...")
	log.Fatal(http.ListenAndServe(":8080", handler))
}

func loginHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
		return
	}

	var credenciais struct {
		Email string `json:"email"`
		Senha string `json:"senha"`
	}

	if err := json.NewDecoder(r.Body).Decode(&credenciais); err != nil {
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}

	var senhaBanco string
	query := "SELECT senha FROM usuario WHERE email = ? AND status_conta = 'ativo'"

	err := db.QueryRow(query, credenciais.Email).Scan(&senhaBanco)

	if err != nil || credenciais.Senha != senhaBanco {
		http.Error(w, "Credenciais inválidas", http.StatusUnauthorized)
		return
	}

	tokenGerado := "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.token_apresentacao_sofos_2026"

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(RespostaAutenticacao{Token: tokenGerado})
}
