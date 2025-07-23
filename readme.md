## BackEnd

### Setup Virtual Environment

1. **Navigate to the Backend Directory:**
   - Ensure you are in the directory containing `manage.py`.

2. **Create and Activate Virtual Environment:**
   - Create the virtual environment:
     ```bash
     python -m venv venv
     ```
   - Activate the virtual environment:
     - **Git Bash:** `source venv/Scripts/activate`
     - **Windows Command Prompt:** `venv\Scripts\activate.bat`
     - **Windows PowerShell:** `venv\Scripts\Activate.ps1`
     - **Mac/Linux:** `source venv/bin/activate`

3. **Install Dependencies:**
   - Run:
     ```bash
     pip install -r requirements.txt
     ```
     ### updates requirements if you install new packages 
     pip freeze > requirements.txt

### Running the Server

- Start the Django server:
  ```bash
  python manage.py runserver
  ```

### Making Changes to Models

- After modifying models, run:
  ```bash
  python manage.py makemigrations
  python manage.py migrate
  ```

## FrontEnd

### Running the Frontend

1. **Navigate to the Frontend Directory:**
   - Ensure you are in the directory containing `package.json`.

2. **Install Dependencies:**
   - Run:
     ```bash
     npm install
     ```

3. **Start the Development Server:**
   - Run:
     ```bash
     npm run dev
     ```

