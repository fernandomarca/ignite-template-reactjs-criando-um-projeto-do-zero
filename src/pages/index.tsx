import { GetStaticProps } from 'next';
import Head from 'next/head';
import { FiCalendar, FiUser } from 'react-icons/fi';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home(): JSX.Element {
  return (
    <>
      <Head>
        <title>Home</title>
      </Head>
      <div className={styles.container}>
        <header>
          <img src="/logo.svg" alt="logo" />
        </header>
        <main>
          <article>
            <h1>Como utilizar Hooks</h1>
            <h4>Pensando em sincronização em vez de ciclos de vida.</h4>
            <div className={styles.info}>
              <div>
                <FiCalendar />
                <span>15 Mar 2021</span>
              </div>
              <div>
                <FiUser />
                <span>Fernando Marca</span>
              </div>
            </div>
          </article>
          <article>
            <h1>Criando um app CRA do zero</h1>
            <h4>
              Tudo sobre como criar a sua primeira aplicação utilizando Create
              React App
            </h4>
            <div className={styles.info}>
              <div>
                <FiCalendar />
                <span>15 Mar 2021</span>
              </div>
              <div>
                <FiUser />
                <span>Fernando Marca</span>
              </div>
            </div>
          </article>
          <button
            type="button"
            onClick={() => {
              console.log('carregando...');
            }}
          >
            Carregar mais posts
          </button>
        </main>
      </div>
    </>
  );
}

// export const getStaticProps = async () => {
//   // const prismic = getPrismicClient();
//   // const postsResponse = await prismic.query(TODO);

//   // TODO
// };
