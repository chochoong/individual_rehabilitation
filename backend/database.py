import oracledb
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

oracledb.init_oracle_client(lib_dir=r"C:\oracle\instantclient_21_22")

dsn = oracledb.makedsn("localhost", 1521, sid="XE")
DATABASE_URL = f"oracle+oracledb://kosa:1234@{dsn}"

engine = create_engine(DATABASE_URL, max_identifier_length=30)
sessionFactory = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    session = sessionFactory()
    try:
        yield session
    finally:
        session.close()

def check_connection():
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 'OK' FROM DUAL"))
            print("연결 성공: ", result.scalar())

            user = conn.execute(text("SELECT USER FROM DUAL"))
            print("접속 사용자: ", user.scalar())

    except Exception as e:
        print("연결 실패: ", e)

if __name__ == "__main__":
    check_connection()