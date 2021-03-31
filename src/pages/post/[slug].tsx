/* eslint-disable no-return-assign */
import format from 'date-fns/format';
import { ptBR } from 'date-fns/locale';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { RichText } from 'prismic-dom';
import Prismic from '@prismicio/client';
import Link from 'next/link';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import styles from './post.module.scss';
import Comments from '../../components/Comments';

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
  preview: boolean;
}

export default function Post({ post, preview }: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  const tempRead = post.data.content.reduce((acc, content) => {
    const textBody = RichText.asText(content.body)
      .split(/<.+?>(.+?)<\/.+?>/g)
      .filter(t => t);

    const ar = [];
    textBody.forEach(fr => {
      fr.split(' ').forEach(pl => {
        ar.push(pl);
      });
    });

    const min = Math.ceil(ar.length / 200);
    return acc + min;
  }, 0);

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
                    "dd MMM' 'yyyy",
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
                <span>{tempRead} min</span>
              </div>
            </div>
            <div className={styles.lastDateEditing}>
              *editado em 19 mar 2021, às 15:49
            </div>

            {post.data.content.map(section => (
              <div className={styles.section} key={`${section.heading}`}>
                <h1>{section.heading}</h1>
                <div
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(section.body),
                  }}
                />
              </div>
            ))}
          </article>
          <div className={styles.postsNaveNextAndRedo}>
            <div>
              <span>Como utilizar Hooks</span>
              <span>Criando um app CRA do Zero</span>
            </div>
            <div>
              <Link href="/#">
                <a>Post anterior</a>
              </Link>
              <Link href="/#">
                <a>Próximo post </a>
              </Link>
            </div>
          </div>
          <Comments />
          {preview && (
            <aside className={styles.buttonModePreview}>
              <Link href="/api/exit-preview">
                <a>Sair do modo Preview</a>
              </Link>
            </aside>
          )}
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
      fetch: ['post.uid'],
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

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
  previewData,
}) => {
  const prismic = getPrismicClient();
  const { slug } = params;
  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      author: response.data.author,
      banner: {
        url: response.data.banner.url,
      },
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: [...content.body],
        };
      }),
    },
  };

  return {
    props: {
      post,
      preview,
    },
    revalidate: 3600, // 1 hora
  };
};
