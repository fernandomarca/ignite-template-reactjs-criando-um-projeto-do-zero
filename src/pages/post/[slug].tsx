import format from 'date-fns/format';
import { ptBR } from 'date-fns/locale';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { RichText } from 'prismic-dom';
import Prismic from '@prismicio/client';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  function calculationReadPost(): void {
    //
  }

  return (
    <>
      <Header />
      <main>
        <div className={styles.banner}>
          <img src={post.data.banner.url} alt="banner" />
        </div>
        <div className={styles.container}>
          <article>
            <h1>{post.data.title}</h1>
            <div className={styles.info}>
              <div>
                <FiCalendar />
                <span>
                  {format(
                    new Date(post.first_publication_date),
                    'dd MMM yyyy',
                    {
                      locale: ptBR,
                    }
                  )}
                </span>
              </div>
              <div>
                <FiUser />
                <span>{post.data.author}</span>
              </div>

              <div>
                <FiClock />
                <span>4 min</span>
              </div>
            </div>

            <div className={styles.contentInitial}>
              <h1>{post.data.content[0].heading}</h1>
              <div
                dangerouslySetInnerHTML={{
                  __html: post.data.content[0].body[0].text,
                }}
              />
            </div>

            <div className={styles.contentMain}>
              <h1>{post.data.content[1].heading}</h1>
              <div
                dangerouslySetInnerHTML={{
                  __html: post.data.content[1].body[0].text,
                }}
              />
            </div>
          </article>
        </div>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 2,
    }
  );

  const paths = posts.results.map(post => ({
    params: { slug: post.uid },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient();
  const { slug } = params;
  const response = await prismic.getByUID('posts', String(slug), {});

  const { first_publication_date, data } = response;

  const contentFormated = data.content.map(content => {
    return {
      heading: content.heading,
      body: [{ text: RichText.asHtml(content.body) }],
    };
  });

  const dataFormated = {
    title: data.title,
    banner: { url: data.banner.url },
    author: data.author,
    content: contentFormated,
  };

  return {
    props: {
      post: {
        first_publication_date,
        data: dataFormated,
      },
    },
  };
};
