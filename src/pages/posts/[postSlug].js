import Head from 'next/head'
import Link from 'next/link'
import { gql } from '@apollo/client';
import React, { useEffect,useState } from 'react';

import { getApolloClient } from 'lib/apollo-client';

import styles from '../../styles/Home.module.css'

export default function Post({ post, site }) {
  const [currentqst, setQuestion] = useState(0)
  const [totalqst, setTotalQst] = useState(0)
  const [question, setQst] = useState("")
  const [answers, setAnswers] = useState([])
  const [answerss, setAnswerss] = useState(["ok","ok"])
  const [showanswers, setShowAnswers] = useState(false)

  const nextqst = () => {
    let totalqst = Object.keys(post.quiz.questions[0].question).length
    setTotalQst(totalqst)
    if (post.quiz.questions[0].question[currentqst]) {
     // console.log(post.quiz.questions[0].question[currentqst].answers)
      setQst(post.quiz.questions[0].question[currentqst].mainQuestion)
      setShowAnswers(true)
      setAnswers(post.quiz.questions[0].question[currentqst].answers)

  
      
    }
    else 
    console.log ("salina")
    setQuestion(currentqst+1)

  }
  const sanitizedData = () => ({
    __html: post.quiz.maindescription
  })
  return (
    <div className={styles.container}>
      <Head>
        <title>{ post.quiz.title }</title>
        <meta name="description" content={`Read more about ${post.title} on ${site.title}`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          { post.quiz.title }
         
        </h1>
        <h1 className={styles.title}>
        {currentqst} / {totalqst}
         
        </h1>

       
        <div
      dangerouslySetInnerHTML={sanitizedData()}
    />

    <button onClick={ () => nextqst() }>Click me</button>

    <h1>
      {question}
    </h1>

{
  Object.keys(answers).map((answernum, index) => {
    let answerTitle = answers[answernum].answerTitle
    let correct = answers[answernum].correct
    
    return (
        <p key={index}>
        {answerTitle}
            {correct}
        </p>
    );
})
}



     

        <div className={styles.grid}>
          <div className={styles.content} dangerouslySetInnerHTML={{
            __html: post.content
          }} />
        </div>

        <p className={styles.backToHome}>
          <Link href="/">
            <a>
              &lt; Back to home
            </a>
          </Link>
        </p>
      </main>
    </div>
  )
}

export async function getStaticProps({ params = {} } = {}) {
  const { postSlug } = params;

  const apolloClient = getApolloClient();

  const data = await apolloClient.query({
    query: gql`
      query PostBySlug($slug: String!) {
        generalSettings {
          title
        }
        postBy(slug: $slug) {
          id
          content
          title
          slug
         
            quiz {
              fieldGroupName
              maindescription
              title
              mainpic {
                mediaItemUrl
              }
              questions {
                fieldGroupName
                question {
                  fieldGroupName
                  mainQuestion
                  questionPicture {
                    mediaItemUrl
                  }
                  answers {
                    answerTitle
                    correct
                    fieldGroupName
                    answerPicture {
                      mediaItemUrl
                    }
                  }
                }
              }
            
          }
        }
      }
    `,
    variables: {
      slug: postSlug
    }
  });

  const post = data?.data.postBy;

  const site = {
    ...data?.data.generalSettings
  }

  return {
    props: {
      post,
      site
    }
  }
}

export async function getStaticPaths() {
  const apolloClient = getApolloClient();

  const data = await apolloClient.query({
    query: gql`
      {
        posts(first: 10000) {
          edges {
            node {
              id
              title
              slug
            }
          }
        }
      }
    `,
  });

  const posts = data?.data.posts.edges.map(({ node }) => node);

  return {
    paths: posts.map(({ slug }) => {
      return {
        params: {
          postSlug: slug
        }
      }
    }),
    fallback: false
  }
}